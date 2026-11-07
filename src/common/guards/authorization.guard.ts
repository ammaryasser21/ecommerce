
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../enums/role.js';
import { IUser } from '../interface/user.interface.js';

@Injectable()
export class AuthorizeGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {

        // Get required roles
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        // No roles required
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Get request
        const request = context
            .switchToHttp()
            .getRequest<Request>();

        const user = request.user;

        // Check Authentication
        if (!user) {
            throw new UnauthorizedException(
                'Authentication required',
            );
        }

        // Check Authorization
        if (!user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'You are not allowed to access this resource',
            );
        }

        return true;
    }
}
