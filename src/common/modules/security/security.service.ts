import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';

@Injectable()
export class SecurityService {
    private readonly SALT_ROUNDS: number;
    private readonly ENCRYPTION_KEY: Buffer;

    private readonly ALGORITHM = 'aes-256-gcm';
    private readonly IV_LENGTH = 12;
    private readonly AUTH_TAG_LENGTH = 16;

    constructor(private readonly configService: ConfigService) {
        this.SALT_ROUNDS = Number(
            this.configService.get('SALT_ROUNDS') || 10,
        );

        const encryptionKey = this.configService.get<string>(
            'ENCRYPTION_KEY',
        );

        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY is missing');
        }

        this.ENCRYPTION_KEY = Buffer.from(encryptionKey, 'hex');

        if (this.ENCRYPTION_KEY.length !== 32) {
            throw new Error(
                'ENCRYPTION_KEY must contain 32 bytes (64 hex characters)',
            );
        }
    }

    // Hash password or any value
    async hashValue(value: string): Promise<string> {
        return bcrypt.hash(String(value), this.SALT_ROUNDS);
    }

    // Compare plain value with hashed value
    async compareHash(
        value: string,
        hashedValue: string,
    ): Promise<boolean> {
        return bcrypt.compare(String(value), hashedValue);
    }

    // Hash tokens using SHA-256
    hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token, 'utf8')
            .digest('hex');
    }

    // Encrypt sensitive data
    encrypt(text: string): string {
        const iv = crypto.randomBytes(this.IV_LENGTH);

        const cipher = crypto.createCipheriv(
            this.ALGORITHM,
            this.ENCRYPTION_KEY,
            iv,
        );

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return [
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted,
        ].join(':');
    }

    // Decrypt sensitive data
    decrypt(encryptedText: string): string {
        const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

        if (!ivHex || !authTagHex || !encrypted) {
            throw new Error('Invalid encrypted value');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        if (
            iv.length !== this.IV_LENGTH ||
            authTag.length !== this.AUTH_TAG_LENGTH
        ) {
            throw new Error('Invalid encryption data');
        }

        const decipher = crypto.createDecipheriv(
            this.ALGORITHM,
            this.ENCRYPTION_KEY,
            iv,
        );

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}