import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AIService } from "../ai/ai.service";
import { AppException } from "../common/exceptions/app.exception";
import { ExceptionCode } from "../common/constants/exception-code.constant";

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AIService
    ) { }

    private sortUserIds(userA: string, userB: string) {
        return userA < userB ? [userA, userB] : [userB, userA];
    }

    async ensureChatAccess(chatId: string, userId: string) {
        const chat = await this.prisma.chat.findUnique({
            where: { chatId },
        });

        if (!chat) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Chat not found");
        }

        if (chat.userOneId !== userId && chat.userTwoId !== userId) {
            throw new AppException(ExceptionCode.FORBIDDEN, "You are not a member of this chat");
        }

        return chat;
    }

    async findOrCreateChat(currentUserId: string, partnerUserId: string, chatId?: string) {
        if (chatId) {
            return this.ensureChatAccess(chatId, currentUserId);
        }

        const [userOneId, userTwoId] = this.sortUserIds(currentUserId, partnerUserId);

        const existingChat = await this.prisma.chat.findFirst({
            where: { userOneId, userTwoId },
        });

        if (existingChat) {
            return existingChat;
        }

        return this.prisma.chat.create({
            data: {
                userOneId,
                userTwoId,
            },
        });
    }

    async saveMessage(chatId: string, senderId: string, content: string) {
        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId,
                content,
            },
        });

        await this.prisma.chat.update({
            where: { chatId },
            data: { updateAt: new Date() },
        });

        // Async AI analysis for Japanese messages (non-blocking) - DISABLED for manual trigger
        // this.analyzeAndSaveAsync(message.messageId, content, chatId);

        return message;
    }

    /**
     * Analyze message asynchronously and save to DB
     * Called manually from controller
     */
    async analyzeAndSave(messageId: string, userId: string) {
        try {
            const message = await this.prisma.message.findUnique({
                where: { messageId },
            });

            if (!message) {
                throw new AppException(ExceptionCode.NOT_FOUND, "Message not found");
            }

            const content = message.content;
            const chatId = message.chatId;

            // Check if message contains Japanese characters
            const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(content);
            if (!hasJapanese) {
                return;
            }

            // Get context description if available for THIS user
            const chatContext = await this.prisma.chatContext.findUnique({
                where: {
                    UQ_ChatUserContext: {
                        chatId,
                        userId,
                    },
                },
            });

            // Analyze the message
            const analysis = await this.aiService.analyzeReceivedMessage(
                content,
                chatContext?.contextDescription,
                undefined // No conversation history for now
            );

            // Save analysis to database
            await this.prisma.message.update({
                where: { messageId },
                data: {
                    aiAnalysisContent: JSON.stringify(analysis),
                },
            });

            this.logger.log(`AI analysis saved for message ${messageId}`);
            return analysis;
        } catch (error) {
            this.logger.error(`Failed to analyze message ${messageId}:`, error);
            return null;
        }
    }

    async getMessages(chatId: string, userId: string, limit = 50) {
        await this.ensureChatAccess(chatId, userId);
        return this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                sender: {
                    select: {
                        userId: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });
    }

    async getUserChats(userId: string) {
        return this.prisma.chat.findMany({
            where: {
                OR: [{ userOneId: userId }, { userTwoId: userId }],
            },
            include: {
                userOne: { select: { userId: true, fullName: true, email: true } },
                userTwo: { select: { userId: true, fullName: true, email: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updateAt: "desc" },
        });
    }

    async deleteMessage(messageId: string, userId: string) {
        const message = await this.prisma.message.findUnique({
            where: { messageId },
        });

        if (!message) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Message not found");
        }

        if (message.senderId !== userId) {
            throw new AppException(
                ExceptionCode.FORBIDDEN,
                "You can only delete your own messages"
            );
        }

        await this.prisma.message.delete({
            where: { messageId },
        });

        return { messageId, chatId: message.chatId };
    }

    async getMessageById(messageId: string) {
        const message = await this.prisma.message.findUnique({
            where: { messageId },
        });

        if (!message) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Message not found");
        }

        return message;
    }
}

