
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';

import type { Request } from 'express';

import { RedisService } from '../modules/redis/redis.service.js';

import { tokenTypes } from '../enums/token.js';

import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { TokenService } from '../service/token.service.js';
import { UserRepository } from '../../repository/user.repository.js';

import {
    TOKEN_TYPE_KEY,
} from '../decorators/token-type.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly tokenService: TokenService,
        private readonly userRepo: UserRepository,
        private readonly redisService: RedisService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        if (isPublic) return true;

        const requiredTokenType =
            this.reflector.getAllAndOverride<tokenTypes>(
                TOKEN_TYPE_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            ) ?? tokenTypes.ACCESS;

        // Get HTTP Request
        const request = context
            .switchToHttp()
            .getRequest<Request>();

        // Extract Authorization Header
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException(
                'Access Token is required',
            );
        }

        const [scheme, accessToken, extra] = authHeader.split(' ');

        if (
            scheme !== 'Bearer' ||
            !accessToken ||
            extra !== undefined
        ) {
            throw new UnauthorizedException(
                'Authorization header must be: Bearer <token>',
            );
        }

        // Verify Access Token
        const decoded = await this.tokenService.decodeToken(
            accessToken,
            requiredTokenType,
        );

        const { id, jti, iat } = decoded;

        if (!id || !jti || !iat) {
            throw new UnauthorizedException(
                'Invalid access token',
            );
        }

        // Check Token Revocation in Redis
        const revokedToken = await this.redisService.getToken({
            userId: id,
            tokenSigniture: jti,
        });

        if (revokedToken) {
            throw new UnauthorizedException(
                'Please login again',
            );
        }

        // Find User
        const user = await this.userRepo.findOne({
            filter: { _id: id },
            projection: {},
            options: {
                populate: 'friends',
                lean: false,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check Credentials Change
        if (user.changeCredentials) {

            const logoutTime = Math.floor(
                user.changeCredentials.getTime() / 1000,
            );

            if (logoutTime >= iat) {
                throw new UnauthorizedException(
                    'Please login again',
                );
            }
        }

        request.user = user;
        request.payload = decoded;

        return true;
    }
}
