import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface UploadedFile {
    url: string;
    name: string;
    type: string;
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly publicUrl: string;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('S3_REGION') || 'auto';
        const endpoint = this.configService.get<string>('S3_ENDPOINT')!;
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID')!;
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY')!;
        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME')!;
        this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL')!;

        this.s3Client = new S3Client({
            region: region,
            endpoint: endpoint,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
            forcePathStyle: true,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'chat'): Promise<UploadedFile> {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const key = `${folder}/${fileName}`;

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read', // Depends on the provider, R2 might not use this
            });

            await this.s3Client.send(command);

            const url = this.publicUrl
                ? `${this.publicUrl}/${key}`
                : `${this.configService.get<string>('S3_ENDPOINT')!}/${this.bucketName}/${key}`;

            return {
                url,
                name: file.originalname,
                type: file.mimetype,
            };
        } catch (error) {
            this.logger.error(`Error uploading file to S3: ${error.message}`, error.stack);
            throw error;
        }
    }
}
