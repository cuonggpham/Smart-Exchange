import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        // Fix: The mariadb driver requires the protocol to be mariadb://
        let connectionUrl = process.env.DATABASE_URL!;
        if (connectionUrl.startsWith("mysql://")) {
            connectionUrl = connectionUrl.replace("mysql://", "mariadb://");
        }

        const adapter = new PrismaMariaDb(connectionUrl);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
