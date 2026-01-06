import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateHistoryDto {
    @IsString()
    receiverName: string;

    @IsOptional()
    @IsString()
    chatId?: string;

    @IsOptional()
    @IsString()
    contextDescription?: string;

    @IsString()
    originalText: string;

    @IsString()
    selectedSuggestion: string;

    @IsEnum(['polite', 'casual', 'formal'])
    suggestionLevel: 'polite' | 'casual' | 'formal';

    @IsOptional()
    @IsString()
    culturalNotes?: string;
}

export class HistoryResponseDto {
    historyId: string;
    receiverName: string;
    chatId?: string;
    contextDescription?: string;
    originalText: string;
    selectedSuggestion: string;
    suggestionLevel: string;
    culturalNotes?: string;
    createdAt: Date;
}

export class HistoryListResponseDto {
    items: HistoryResponseDto[];
    total: number;
    page: number;
    limit: number;
}
