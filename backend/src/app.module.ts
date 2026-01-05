import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ChatModule } from "./chat/chat.module";
import { AIModule } from "./ai/ai.module";
import { ContextModule } from "./context/context.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";

@Module({
    imports: [PrismaModule, UsersModule, AuthModule, ChatModule, AIModule, ContextModule],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
