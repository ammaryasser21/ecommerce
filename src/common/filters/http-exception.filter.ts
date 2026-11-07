
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isDev = process.env.NODE_ENV === 'development';

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message;

        const errorCode =
            typeof exceptionResponse === 'object'
                ? (exceptionResponse as any).errorCode
                : undefined;

        if (status >= 500) {
            this.logger.error(
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errorCode,

            ...(isDev && {
                path: request.url,
                timestamp: new Date().toISOString(),
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        });
    }
}
