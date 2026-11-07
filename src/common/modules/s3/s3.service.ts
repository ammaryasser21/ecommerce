
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { IDeleteFile, IDeleteFiles, IGetFile, IUploadFile, IUploadFiles, IUploadLargeFile, IUploadPresignedFile } from '../../interface/s3.interface.js';
import { MIME_TYPES } from '../../enums/multer.js';


@Injectable()
export class S3Service implements OnModuleDestroy {
    private readonly logger = new Logger(S3Service.name);

    private readonly client: S3Client;
    private readonly bucket: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.bucket = this.configService.getOrThrow<string>('BUCKET_NAME');

        this.client = new S3Client({
            region: this.configService.getOrThrow<string>('BUCKET_REGION'),

            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('ACCESS_KEY'),
                secretAccessKey: this.configService.getOrThrow<string>('SECRET_KEY'),
            },
        });
    }

    onModuleDestroy(): void {
        this.client.destroy();
    }

    private generateKey(
        folder = 'general',
        path = '',
        fileName: string,
    ): string {
        return `social_media/${folder}/${path}/${randomUUID()}-${fileName}`;
    }

    async uploadFile({
        file,
        bucket = this.bucket,
        folder = 'general',
        path = '',
        ACL = 'private',
        ContentType,
    }: IUploadFile) {

        const Body = file.buffer ?? createReadStream(file.path);

        const Key = this.generateKey(
            folder,
            path,
            file.originalname,
        );

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key,
            Body,
            ACL,
            ContentType: file.mimetype || ContentType,
        });

        await this.client.send(command);

        return Key;
    }

    async uploadFiles({
        files,
        bucket = this.bucket,
        folder = 'general',
        path = '',
        ACL = 'private',
        ContentType,
    }: IUploadFiles) {

        return Promise.all(
            files.map((file) =>
                this.uploadFile({
                    file,
                    bucket,
                    folder,
                    path,
                    ACL,
                    ContentType,
                }),
            ),
        );
    }

    async uploadLargeFile({
        file,
        bucket = this.bucket,
        folder = 'general',
        path = '',
        ACL = 'private',
        ContentType,
        partSize = 5 * 1024 * 1024,
    }: IUploadLargeFile) {

        const Body = file.buffer ?? createReadStream(file.path);

        const Key = this.generateKey(
            folder,
            path,
            file.originalname,
        );

        const parallelUpload = new Upload({
            client: this.client,

            params: {
                Bucket: bucket,
                Key,
                Body,
                ACL,
                ContentType: file.mimetype || ContentType,
            },

            queueSize: 2,
            partSize,
        });

        parallelUpload.on('httpUploadProgress', (progress) => {
            this.logger.debug(JSON.stringify(progress));
        });

        await parallelUpload.done();

        return Key;
    }

    async uploadPresignedFile({
        fileName,
        folder = 'general',
        path = '',
        bucket = this.bucket,
        contentType = MIME_TYPES.IMAGE[1],
        expiresIn = 2,
    }: IUploadPresignedFile) {

        const Key = this.generateKey(folder, path, fileName);

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(
            this.client,
            command,
            {
                expiresIn: expiresIn * 60,
            },
        );

        return { url, key: Key };
    }

    async getFile({
        bucket = this.bucket,
        fileName,
    }: IGetFile) {

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName,
        });

        return this.client.send(command);
    }

    async getPresignedFile({
        bucket = this.bucket,
        fileName,
        download = false,
        expiresIn = 5,
    }: IGetFile) {

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName,

            ...(download && {
                ResponseContentDisposition:
                    `attachment; filename="${fileName}"`,
            }),
        });

        return getSignedUrl(
            this.client,
            command,
            {
                expiresIn: expiresIn * 60,
            },
        );
    }

    async deleteFile({
        bucket = this.bucket,
        fileName,
    }: IDeleteFile) {

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileName,
        });

        return this.client.send(command);
    }

    async deleteFiles({
        bucket = this.bucket,
        files,
    }: IDeleteFiles) {

        const command = new DeleteObjectsCommand({
            Bucket: bucket,

            Delete: {
                Objects: files.map((file) => ({
                    Key: file,
                })),
                Quiet: false,
            },
        });

        const result = await this.client.send(command);

        if (result.Errors?.length) {
            this.logger.error(
                `Failed to delete ${result.Errors.length} files`,
            );

            throw new InternalServerErrorException(
                'Some files could not be deleted'
            );
        }

        return result;
    }
}
