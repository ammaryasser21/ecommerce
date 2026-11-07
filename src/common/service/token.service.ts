
import {
    BadRequestException,
    Injectable
} from '@nestjs/common';
import {JwtPayload} from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

import { randomUUID } from 'node:crypto';
import { HydratedDocument } from 'mongoose';

import {
    Credentials,
    GenerateTokenOptions,
    TokenPayload,
    TokenSecrets
} from '../interface/token.interface.js';

import { Role } from '../enums/role.js';
import { IUser } from '../interface/user.interface.js';
import { tokenTypes } from '../enums/token.js';
import { SignOptions } from 'jsonwebtoken';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class TokenService {

    private readonly issuer: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.issuer = this.configService.getOrThrow<string>('ISSUER');
    }


    // ==========================================
    // Get Required Secret
    // ==========================================

    private getRequiredSecret(key: string): string {

        return this.configService.getOrThrow<string>(key);

    }


    // ==========================================
    // Detect User Keys
    // ==========================================

    detectUserKeys(role: Role): TokenSecrets {
        switch (role) {
            case Role.USER:
                return {
                    accessSecret: this.getRequiredSecret(
                        'JWT_ACCESS_SECRET',
                    ),

                    refreshSecret: this.getRequiredSecret(
                        'JWT_REFRESH_SECRET',
                    ),
                };


            case Role.ADMIN:
                return {
                    accessSecret: this.getRequiredSecret(
                        'JWT_ACCESS_SECRET_ADMIN',
                    ),
                    refreshSecret: this.getRequiredSecret(
                        'JWT_REFRESH_SECRET_ADMIN',
                    ),
                };


            default:
                throw new BadRequestException('Invalid Role');

        }

    }


    // ==========================================
    // Generate Token
    // ==========================================

    generateToken({
        data = {},
        secret,
        expiresIn = '15m',
        audience = ['user'],
    }: GenerateTokenOptions): Promise<string> {

        const options: SignOptions = {
            expiresIn,
            issuer: this.issuer,
            audience,
        };

        return this.jwtService.signAsync(
            data,
            {
                secret,
                ...options
            }
        );

    }


    // ==========================================
    // Verify Token
    // ==========================================

    verifyToken(
        token: string,
        secret: string,
        audience: string,
    ): Promise<JwtPayload> {

        const decoded = this.jwtService.verifyAsync(
            token,
            {
                secret,
                issuer: this.issuer,
                audience,
            }
        );

        if (typeof decoded === 'string' || !decoded) {

            throw new BadRequestException('Invalid token payload');

        }

        return decoded;

    }


    // ==========================================
    // Decode Token
    // ==========================================

    decodeToken(
        token: string,
        tokenType: tokenTypes,
    ): Promise<JwtPayload> {

        const data = this.jwtService.decode(token) as TokenPayload | null;

        if (!data || !data.role) {

            throw new BadRequestException('Invalid token');

        }

        const { accessSecret, refreshSecret } =
            this.detectUserKeys(data.role);

        const secret = tokenType === tokenTypes.ACCESS
            ? accessSecret
            : refreshSecret;

        return this.verifyToken(
            token,
            secret,
            data.role,
        );
    }


    // ==========================================
    // Create Credentials
    // ==========================================

    createCredentials(
        user: HydratedDocument<IUser>,
    ): Credentials {

        const jti = randomUUID();

        const { _id, role } = user;

        if (!_id || !role) {
            throw new BadRequestException('User not found');
        }

        const {
            accessSecret,
            refreshSecret,
        } = this.detectUserKeys(role);

        const payload = {
            id: _id.toString(),
            role,
            jti,
        };

        return {
            accessToken: this.generateToken({
                data: payload,
                secret: accessSecret,
                expiresIn: '1h',
                audience: [role],
            }),

            refreshToken: this.generateToken({
                data: payload,
                secret: refreshSecret,
                expiresIn: '7d',
                audience: [role],
            }),
        };

    }

}
