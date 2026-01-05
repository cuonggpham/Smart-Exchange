import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class ContextMessageDto {
    @ApiProperty({
        description: "Sender type - user or other party",
        enum: ["user", "other"],
        example: "other",
    })
    @IsString()
    sender: "user" | "other";

    @ApiProperty({
        description: "Message text content",
        example: "報告書、明日までに出してください",
    })
    @IsString()
    text: string;
}

export class AnalyzeReceivedDto {
    @ApiProperty({
        description: "Japanese text to analyze (received message)",
        example: "ちょっと考えておきます",
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiPropertyOptional({
        description: "User-defined context description for the conversation",
        example: "Đối phương là sếp trưởng bộ phận, đang trong cuộc họp quan trọng",
    })
    @IsOptional()
    @IsString()
    contextDescription?: string;

    @ApiPropertyOptional({
        description: "Recent conversation history for context",
        type: [ContextMessageDto],
    })
    @IsOptional()
    @ApiPropertyOptional({
        description: "Recent conversation history for context",
        type: [ContextMessageDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContextMessageDto)
    conversationHistory?: ContextMessageDto[];

    @ApiPropertyOptional({
        description: "User's display language for analysis output",
        enum: ["vi", "jp"],
        example: "vi",
    })
    @IsOptional()
    @IsString()
    displayLanguage?: "vi" | "jp";
}
