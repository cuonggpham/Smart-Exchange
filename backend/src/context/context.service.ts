import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/exceptions/app.exception";
import { ExceptionCode } from "../common/constants/exception-code.constant";

@Injectable()
export class ContextService {
    constructor(private readonly prisma: PrismaService) { }

    // ============== Chat Context Operations ==============

    async getContext(chatId: string) {
        return this.prisma.chatContext.findUnique({
            where: { chatId },
        });
    }

    async upsertContext(chatId: string, contextDescription: string) {
        // Verify chat exists
        const chat = await this.prisma.chat.findUnique({
            where: { chatId },
        });

        if (!chat) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Chat not found");
        }

        return this.prisma.chatContext.upsert({
            where: { chatId },
            update: { contextDescription },
            create: {
                chatId,
                contextDescription,
            },
        });
    }

    async deleteContext(chatId: string) {
        const existing = await this.prisma.chatContext.findUnique({
            where: { chatId },
        });

        if (!existing) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Context not found");
        }

        return this.prisma.chatContext.delete({
            where: { chatId },
        });
    }

    // ============== Context Template Operations ==============

    async getTemplates(userId: string) {
        return this.prisma.contextTemplate.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async createTemplate(userId: string, templateName: string, description: string) {
        return this.prisma.contextTemplate.create({
            data: {
                userId,
                templateName,
                description,
            },
        });
    }

    async deleteTemplate(templateId: string, userId: string) {
        const template = await this.prisma.contextTemplate.findUnique({
            where: { templateId },
        });

        if (!template) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Template not found");
        }

        if (template.userId !== userId) {
            throw new AppException(ExceptionCode.FORBIDDEN, "You can only delete your own templates");
        }

        return this.prisma.contextTemplate.delete({
            where: { templateId },
        });
    }

    async getTemplateById(templateId: string, userId: string) {
        const template = await this.prisma.contextTemplate.findUnique({
            where: { templateId },
        });

        if (!template) {
            throw new AppException(ExceptionCode.NOT_FOUND, "Template not found");
        }

        if (template.userId !== userId) {
            throw new AppException(ExceptionCode.FORBIDDEN, "Access denied");
        }

        return template;
    }
}
