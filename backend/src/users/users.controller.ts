import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OwnershipGuard } from "../common/guards/ownership.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateJobInfoDto } from "./dto/update-job-info.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get("me")
    getCurrentUser(@Request() req: any) {
        return this.usersService.findOne(req.user.userId);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // --- 👇 QUAN TRỌNG: Phải đặt API này LÊN TRÊN các API có :id ---
    // Nếu để ở dưới, NestJS sẽ tưởng "tutorial-completion" là một cái ID.
    @UseGuards(JwtAuthGuard) // 1. Thêm Guard để xác thực
    @Patch('tutorial-completion')
    completeTutorial(@Request() req: any) {
        // 2. Sửa req.user.id thành req.user.userId (cho giống hàm getCurrentUser)
        return this.usersService.updateTutorialStatus(req.user.userId);
    }
    // ----------------------------------------------------------------

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.usersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, OwnershipGuard)
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard, OwnershipGuard)
    @Patch(":id/job-info")
    updateJobInfo(@Param("id") id: string, @Body() updateJobInfoDto: UpdateJobInfoDto) {
        return this.usersService.updateJobInfo(id, updateJobInfoDto);
    }

    @UseGuards(JwtAuthGuard, OwnershipGuard)
    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.usersService.remove(id);
    }
}