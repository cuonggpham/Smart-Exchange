import { Module } from "@nestjs/common";
import { ContextService } from "./context.service";
import { ContextController } from "./context.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [ContextController],
    providers: [ContextService],
    exports: [ContextService],
})
export class ContextModule { }
