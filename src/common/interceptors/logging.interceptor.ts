import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;

        const start = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    this.logger.log(
                        `${method} ${url} - ${Date.now() - start}ms`,
                    );
                },
                error: (error) => {
                    this.logger.error(
                        `${method} ${url} - ${error.message}`,
                    );
                },
            }),
        );
    }
}