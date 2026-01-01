import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BcryptSecurity } from "../common/security/bcrypt.security";
import { AppException } from "../common/exceptions/app.exception";
import { ExceptionCode } from "../common/constants/exception-code.constant";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateJobInfoDto } from "./dto/update-job-info.dto";
import { JobInfoHelper } from "../common/helpers/job-info.helper";
import * as crypto from "crypto";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existing) {
            throw new AppException(ExceptionCode.CONFLICT, "Email already in use");
        }

        const hashedPassword = await BcryptSecurity.hashPassword(createUserDto.password);

        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                fullName: createUserDto.fullName || createUserDto.email.split("@")[0],
                jobTitle: createUserDto.jobTitle || null,
                languageCode: "vi",
                themeMode: "light",
            },
        });

        return this.serialize(user);
    }

    async findAll() {
        const users = await this.prisma.user.findMany();
        return users.map((user) => this.serialize(user));
    }

    async findOne(user_id: string) {
        const user = await this.prisma.user.findUnique({
            where: { userId: user_id },
        });
        if (!user) {
            throw new AppException(ExceptionCode.NOT_FOUND, "User not found");
        }
        return this.serialize(user);
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(user_id: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { userId: user_id },
        });
        if (!user) {
            throw new AppException(ExceptionCode.NOT_FOUND, "User not found");
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const duplicate = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (duplicate) {
                throw new AppException(ExceptionCode.CONFLICT, "Email already in use");
            }
        }

        const data: any = {};
        if (updateUserDto.email) data.email = updateUserDto.email;
        if (updateUserDto.password)
            data.password = await BcryptSecurity.hashPassword(updateUserDto.password);
        if (updateUserDto.jobTitle !== undefined) data.jobTitle = updateUserDto.jobTitle;
        if (updateUserDto.language !== undefined) data.languageCode = updateUserDto.language;
        if (updateUserDto.themeMode !== undefined) data.themeMode = updateUserDto.themeMode;

        const updatedUser = await this.prisma.user.update({
            where: { userId: user_id },
            data,
        });

        return this.serialize(updatedUser);
    }

    async remove(user_id: string) {
        const user = await this.prisma.user.findUnique({
            where: { userId: user_id },
        });
        if (!user) {
            throw new AppException(ExceptionCode.NOT_FOUND, "User not found");
        }
        await this.prisma.user.delete({ where: { userId: user_id } });
        return { user_id };
    }

    async updateJobInfo(user_id: string, updateJobInfoDto: UpdateJobInfoDto) {
        const user = await this.prisma.user.findUnique({
            where: { userId: user_id },
        });
        if (!user) {
            throw new AppException(ExceptionCode.NOT_FOUND, "User not found");
        }

        try {
            const jobTitle = JobInfoHelper.validateAndFormat(
                updateJobInfoDto.career,
                updateJobInfoDto.position
            );

            const updatedUser = await this.prisma.user.update({
                where: { userId: user_id },
                data: { jobTitle },
            });

            const serialized = this.serialize(updatedUser);
            const parsed = JobInfoHelper.parseJobTitle(updatedUser.jobTitle);

            return {
                ...serialized,
                career: parsed.career,
                position: parsed.position,
            };
        } catch (error) {
            throw new AppException(
                ExceptionCode.BAD_REQUEST,
                error.message || "Invalid job information"
            );
        }
    }

    async upsertGoogleUser(payload: { email: string; fullName: string }) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (existingUser) {
            return this.prisma.user.update({
                where: { userId: existingUser.userId },
                data: {
                    fullName: payload.fullName,
                },
            });
        }

        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await BcryptSecurity.hashPassword(randomPassword);

        return this.prisma.user.create({
            data: {
                email: payload.email,
                password: hashedPassword,
                fullName: payload.fullName,
                languageCode: "vi",
                themeMode: "light",
            },
        });
    }

    private serialize(user: any) {
        const { password, ...rest } = user;
        return rest;
    }

    // --- SỬA LỖI Ở ĐÂY ---

    // Gộp chung logic vào hàm này, đảm bảo kiểu dữ liệu đầu vào nhất quán (string vì userId trong Prisma của bạn có vẻ là String/UUID)
    async updateTutorialStatus(user_id: string) {
        return this.prisma.user.update({
            where: { userId: user_id }, // Dùng đúng biến user_id truyền vào
            data: { isTutorialCompleted: true },
            select: {
                userId: true,
                email: true,
                fullName: true,
                isTutorialCompleted: true,
            },
        });
    }
}
