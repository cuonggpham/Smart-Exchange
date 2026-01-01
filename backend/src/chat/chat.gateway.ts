import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { ExceptionCode } from "../common/constants/exception-code.constant";
import { AppException } from "../common/exceptions/app.exception";
import { SendMessageDto } from "./dto/send-message.dto";
import * as cookie from "cookie";

@WebSocketGateway({
    cors: {
        origin:
            process.env.FRONTEND_URL && process.env.FRONTEND_URL.length > 0
                ? process.env.FRONTEND_URL.split(";").map((url) => url.trim())
                : true,
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService
    ) {}

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                throw new AppException(ExceptionCode.UNAUTHORIZED, "Missing access token");
            }

            const payload = await this.jwtService.verifyAsync(token);
            client.data.user = { userId: payload.user_id, email: payload.email };

            client.join(`user-${payload.user_id}`);
            client.emit("connected", { userId: payload.user_id });
        } catch (error) {
            client.emit("error", { message: "Authentication failed" });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        client.disconnect();
    }

    @SubscribeMessage("join_chat")
    handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatId: string }) {
        if (payload.chatId) {
            client.join(`chat-${payload.chatId}`);
        }
    }

    @SubscribeMessage("send_message")
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SendMessageDto
    ) {
        const user = client.data.user;
        if (!user) {
            throw new AppException(ExceptionCode.UNAUTHORIZED, "User not authenticated");
        }

        if (!payload.content || !payload.receiverId) {
            throw new AppException(ExceptionCode.BAD_REQUEST, "Missing receiver or content");
        }

        const chat = await this.chatService.findOrCreateChat(
            user.userId,
            payload.receiverId,
            payload.chatId
        );

        const message = await this.chatService.saveMessage(
            chat.chatId,
            user.userId,
            payload.content
        );

        const receiverId = chat.userOneId === user.userId ? chat.userTwoId : chat.userOneId;
        const messageResponse = {
            messageId: message.messageId,
            chatId: chat.chatId,
            senderId: user.userId,
            receiverId,
            content: message.content,
            createdAt: message.createdAt,
        };

        client.join(`chat-${chat.chatId}`);
        this.server.to(`chat-${chat.chatId}`).emit("message_received", messageResponse);
        this.server.to(`user-${receiverId}`).emit("new_message_notification", messageResponse);

        return messageResponse;
    }

    @SubscribeMessage("delete_message")
    async handleDeleteMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { messageId: string }
    ) {
        const user = client.data.user;
        if (!user) {
            throw new AppException(ExceptionCode.UNAUTHORIZED, "User not authenticated");
        }

        const result = await this.chatService.deleteMessage(payload.messageId, user.userId);

        this.server.to(`chat-${result.chatId}`).emit("message_deleted", {
            messageId: result.messageId,
            chatId: result.chatId,
        });

        return result;
    }

    private extractToken(client: Socket): string | null {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            return authHeader.slice(7);
        }

        const tokenFromAuth = client.handshake.auth?.token;
        if (typeof tokenFromAuth === "string") {
            return tokenFromAuth;
        }

        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader || typeof cookieHeader !== "string") {
            return null;
        }

        const parsed = cookie.parse(cookieHeader);
        return parsed["access_token"] || null;
    }
}
