import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        // Use the connection URL directly - PrismaMariaDb handles MySQL as well
        const connectionUrl = process.env.DATABASE_URL!;

        // Create adapter with connection string and pool settings
        const adapter = new PrismaMariaDb(connectionUrl, {
            database: "smart_exchange",
        });

        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log("Prisma connected successfully");
        } catch (error) {
            this.logger.error("Failed to connect to database", error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log("Prisma disconnected");
    }
}


