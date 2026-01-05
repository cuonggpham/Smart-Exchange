import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsIn } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class ContextMessageDto {
    @ApiProperty({
        description: "Sender type - user or other party",
        enum: ["user", "other"],
        example: "user",
    })
    @IsString()
    @IsIn(["user", "other"])
    sender: "user" | "other";

    @ApiProperty({
        description: "Message text content",
        example: "こんにちは",
    })
    @IsString()
    text: string;
}

export class CheckCultureDto {
    @ApiProperty({
        description: "Japanese text to analyze for cultural context",
        example: "ちょっと考えておきます",
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiPropertyOptional({
        description: "Recent conversation context (max 5 messages will be used)",
        type: [ContextMessageDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContextMessageDto)
    context?: ContextMessageDto[];

    @ApiPropertyOptional({
        description: "Conversation ID for tracking summary across requests",
        example: "conv_123456",
    })
    @IsOptional()
    @IsString()
    conversationId?: string;

    @ApiPropertyOptional({
        description: "Existing conversation summary to provide context",
        example: "Cuộc trò chuyện về kế hoạch cuối tuần...",
    })
    @IsOptional()
    @IsString()
    existingSummary?: string;

    @ApiPropertyOptional({
        description: "User-defined context description for the conversation",
        example: "Đối phương là sếp trưởng bộ phận, đang giận vì tôi nộp báo cáo muộn",
    })
    @IsOptional()
    @IsString()
    contextDescription?: string;

    @ApiPropertyOptional({
        description: "User's display language for cultural notes output",
        enum: ["vi", "jp"],
        example: "vi",
    })
    @IsOptional()
    @IsString()
    @IsIn(["vi", "jp"])
    displayLanguage?: "vi" | "jp";
}
