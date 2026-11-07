
import type {
    Request,
    Response,
    NextFunction,
} from 'express';

export function loggerMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.log({
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString(),
    });

    next();
}
