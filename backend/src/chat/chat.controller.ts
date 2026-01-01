import { Controller, Get, Delete, Param, Query, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";

@Controller("chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UseGuards(JwtAuthGuard)
    @Get(":chatId/messages")
    async getChatMessages(
        @Param("chatId") chatId: string,
        @Query("limit") limit = "50",
        @Request() req: any
    ) {
        const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
        return this.chatService.getMessages(chatId, req.user.userId, parsedLimit);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserChats(@Request() req: any) {
        return this.chatService.getUserChats(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("messages/:messageId")
    async deleteMessage(@Param("messageId") messageId: string, @Request() req: any) {
        return this.chatService.deleteMessage(messageId, req.user.userId);
    }
}
