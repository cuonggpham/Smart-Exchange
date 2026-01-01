import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { PrismaService } from "../prisma/prisma.service";
import { ChatController } from "./chat.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [AuthModule],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService, PrismaService],
    exports: [ChatService],
})
export class ChatModule {}
