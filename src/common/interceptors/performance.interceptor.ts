import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';

import { Observable, finalize } from 'rxjs';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private logger = new Logger(PerformanceInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();

        return next.handle().pipe(
            finalize(() => {
                const duration = Date.now() - start;

                this.logger.log(`Execution time: ${duration}ms`);
            }),
        );
    }
}