import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HistoryService } from './history.service';
import { CreateHistoryDto, HistoryListResponseDto, HistoryResponseDto } from './dto/history.dto';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Post()
    async create(
        @Req() req: any,
        @Body() dto: CreateHistoryDto
    ): Promise<HistoryResponseDto> {
        return this.historyService.create(req.user.userId, dto);
    }

    @Get()
    async findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('receiver') receiver?: string
    ): Promise<HistoryListResponseDto> {
        return this.historyService.findAll(
            req.user.userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            receiver
        );
    }

    @Get('receivers')
    async getReceivers(@Req() req: any): Promise<string[]> {
        return this.historyService.getReceivers(req.user.userId);
    }

    @Delete(':id')
    async delete(
        @Req() req: any,
        @Param('id') historyId: string
    ): Promise<{ success: boolean }> {
        await this.historyService.delete(req.user.userId, historyId);
        return { success: true };
    }
}
