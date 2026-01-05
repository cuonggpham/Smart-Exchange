import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request, Body } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";

@Controller("chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

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
    @Post("init")
    async initChat(@Body() body: { partnerId: string }, @Request() req: any) {
        return this.chatService.findOrCreateChat(req.user.userId, body.partnerId);
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

    @UseGuards(JwtAuthGuard)
    @Post("messages/:messageId/analyze")
    async analyzeMessage(@Param("messageId") messageId: string, @Request() req: any) {
        // Ensure user has access to the chat containing this message
        const message = await this.chatService.getMessageById(messageId);
        await this.chatService.ensureChatAccess(message.chatId, req.user.userId);

        return this.chatService.analyzeAndSave(messageId, req.user.userId);
    }
}
