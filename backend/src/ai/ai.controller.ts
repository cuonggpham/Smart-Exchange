import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AIService } from "./ai.service";
import { CheckCultureDto } from "./dto/check-culture.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AIController {
    constructor(private readonly aiService: AIService) {}

    @Post("check-culture")
    async checkCulture(@Body() dto: CheckCultureDto) {
        return this.aiService.checkCulture(dto.text, dto.context);
    }
}
