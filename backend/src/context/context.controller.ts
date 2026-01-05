import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ContextService } from "./context.service";
import { UpdateContextDto, CreateTemplateDto } from "./dto/context.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { User } from "../common/decorators/user.decorator";

@ApiTags("Context")
@Controller("context")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContextController {
    constructor(private readonly contextService: ContextService) { }

    // ============== Chat Context Endpoints ==============

    @Get(":chatId")
    @ApiOperation({ summary: "Get context for a specific chat" })
    @ApiResponse({ status: 200, description: "Context retrieved successfully" })
    @ApiResponse({ status: 404, description: "Context not found" })
    async getContext(
        @Param("chatId") chatId: string,
        @User("userId") userId: string
    ) {
        const context = await this.contextService.getContext(chatId, userId);
        return context || { contextDescription: "" };
    }

    @Put(":chatId")
    @ApiOperation({ summary: "Create or update context for a chat" })
    @ApiResponse({ status: 200, description: "Context updated successfully" })
    async upsertContext(
        @Param("chatId") chatId: string,
        @User("userId") userId: string,
        @Body() dto: UpdateContextDto
    ) {
        return this.contextService.upsertContext(chatId, userId, dto.contextDescription);
    }

    @Delete(":chatId")
    @ApiOperation({ summary: "Delete context for a chat" })
    @ApiResponse({ status: 200, description: "Context deleted successfully" })
    async deleteContext(
        @Param("chatId") chatId: string,
        @User("userId") userId: string
    ) {
        return this.contextService.deleteContext(chatId, userId);
    }

    // ============== Context Template Endpoints ==============

    @Get("templates/list")
    @ApiOperation({ summary: "Get all templates for current user" })
    @ApiResponse({ status: 200, description: "Templates retrieved successfully" })
    async getTemplates(@User("userId") userId: string) {
        return this.contextService.getTemplates(userId);
    }

    @Post("templates")
    @ApiOperation({ summary: "Create a new context template" })
    @ApiResponse({ status: 201, description: "Template created successfully" })
    async createTemplate(
        @User("userId") userId: string,
        @Body() dto: CreateTemplateDto
    ) {
        return this.contextService.createTemplate(
            userId,
            dto.templateName,
            dto.description
        );
    }

    @Delete("templates/:templateId")
    @ApiOperation({ summary: "Delete a context template" })
    @ApiResponse({ status: 200, description: "Template deleted successfully" })
    async deleteTemplate(
        @User("userId") userId: string,
        @Param("templateId") templateId: string
    ) {
        return this.contextService.deleteTemplate(templateId, userId);
    }
}
