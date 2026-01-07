import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto, HistoryResponseDto, HistoryListResponseDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateHistoryDto): Promise<HistoryResponseDto> {
        const history = await this.prisma.suggestionHistory.create({
            data: {
                userId,
                chatId: dto.chatId,
                receiverName: dto.receiverName,
                contextDescription: dto.contextDescription,
                originalText: dto.originalText,
                selectedSuggestion: dto.selectedSuggestion,
                suggestionLevel: dto.suggestionLevel,
                culturalNotes: dto.culturalNotes,
            },
        });

        return this.mapToDto(history);
    }

    async findAll(
        userId: string,
        page = 1,
        limit = 20,
        receiverFilter?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<HistoryListResponseDto> {
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (receiverFilter) {
            where.receiverName = {
                contains: receiverFilter,
            };
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                // Set endDate to end of day
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.createdAt.lte = endOfDay;
            }
        }

        const [items, total] = await Promise.all([
            this.prisma.suggestionHistory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.suggestionHistory.count({ where }),
        ]);

        return {
            items: items.map((item) => this.mapToDto(item)),
            total,
            page,
            limit,
        };
    }

    async delete(userId: string, historyId: string): Promise<void> {
        await this.prisma.suggestionHistory.deleteMany({
            where: {
                historyId,
                userId,
            },
        });
    }

    async getReceivers(userId: string): Promise<string[]> {
        const results = await this.prisma.suggestionHistory.findMany({
            where: { userId },
            select: { receiverName: true },
            distinct: ['receiverName'],
            orderBy: { createdAt: 'desc' },
        });

        return results.map((r) => r.receiverName);
    }

    private mapToDto(history: any): HistoryResponseDto {
        return {
            historyId: history.historyId,
            receiverName: history.receiverName,
            chatId: history.chatId,
            contextDescription: history.contextDescription,
            originalText: history.originalText,
            selectedSuggestion: history.selectedSuggestion,
            suggestionLevel: history.suggestionLevel,
            culturalNotes: history.culturalNotes,
            createdAt: history.createdAt,
        };
    }
}
