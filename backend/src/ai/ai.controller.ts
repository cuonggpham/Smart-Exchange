import { Body, Controller, Get, Post, UseGuards, Request as Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AIService } from "./ai.service";
import { CheckCultureDto } from "./dto/check-culture.dto";
import { AnalyzeReceivedDto } from "./dto/analyze-received.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags("AI")
@Controller("ai")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Post("check-culture")
    @ApiOperation({
        summary: "Check cultural context of Japanese text",
        description:
            "Analyzes Japanese text for cultural nuances with automatic conversation summarization when message count exceeds threshold",
    })
    @ApiResponse({
        status: 200,
        description: "Cultural analysis with suggestions and optional conversation summary",
    })
    async checkCulture(@Body() dto: CheckCultureDto, @Req() req: any) {
        return this.aiService.checkCultureWithSummary({
            text: dto.text,
            context: dto.context,
            conversationId: dto.conversationId,
            existingSummary: dto.existingSummary,
            displayLanguage: dto.displayLanguage,
            contextDescription: dto.contextDescription,
            userId: req.user.userId,
        });
    }

    @Get("status")
    @ApiOperation({
        summary: "Check AI service availability",
        description: "Returns whether the AI service is properly configured and available",
    })
    @ApiResponse({
        status: 200,
        description: "AI service status",
    })
    getStatus() {
        return {
            available: this.aiService.isAvailable(),
            timestamp: new Date().toISOString(),
        };
    }

    @Post("analyze-received")
    @ApiOperation({
        summary: "Analyze a received Japanese message",
        description:
            "Analyzes a Japanese message received by the user, providing translation with inferred subjects, intent summary, and cultural notes",
    })
    @ApiResponse({
        status: 200,
        description: "Analysis with translation, intent, and cultural context",
    })
    async analyzeReceived(@Body() dto: AnalyzeReceivedDto) {
        return this.aiService.analyzeReceivedMessage(
            dto.text,
            dto.contextDescription,
            dto.conversationHistory,
            dto.displayLanguage
        );
    }
}
