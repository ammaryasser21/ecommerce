import type { Request } from 'express';
import { IUser } from './user.interface.js';

export type CurrentUserData = keyof IUser | 'all';

export interface RequestWithUser extends Request {
    user?: IUser;
}

export interface GraphQLContext {
    req?: RequestWithUser;
    request?: RequestWithUser;
    user?: IUser;
}

export interface WsClient {
    user?: IUser;
    data?: {
        user?: IUser;
    };
}