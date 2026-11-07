import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';


import type {
    CurrentUserData,
    RequestWithUser,
    GraphQLContext,
    WsClient,
} from '../interface/current-user.interface.js';
import { IUser } from '../interface/user.interface.js';
import { GqlExecutionContext } from '@nestjs/graphql';


export const CurrentUser = createParamDecorator<
    CurrentUserData | undefined,
    IUser | IUser[keyof IUser]
>((data, context: ExecutionContext) => {

    let user: IUser | undefined;

    switch (context.getType<string>()) {

        // HTTP
        case 'http': {
            const request = context
                .switchToHttp()
                .getRequest<RequestWithUser>();

            user = request.user;
            break;
        }

        // GraphQL
        case 'graphql': {
            const gqlContext = GqlExecutionContext
                .create(context)
                .getContext<GraphQLContext>();

            user = gqlContext.req?.user
                ?? gqlContext.request?.user
                ?? gqlContext.user;

            break;
        }

        // WebSocket
        case 'ws': {
            const client = context
                .switchToWs()
                .getClient<WsClient>();

            user = client.user ?? client.data?.user;
            break;
        }

        default:
            throw new UnauthorizedException(
                'Unsupported execution context',
            );
    }

    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    switch (data) {

        case undefined:
        case 'all':
            return user;

        default:
            return user[data];
    }

});