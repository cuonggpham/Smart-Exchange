import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ChatModule } from "./chat/chat.module";
import { AIModule } from "./ai/ai.module";

@Module({
    imports: [PrismaModule, UsersModule, AuthModule, ChatModule, AIModule],
})
export class AppModule {}
