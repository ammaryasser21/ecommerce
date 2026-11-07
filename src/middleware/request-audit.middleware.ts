
import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';

import type {
  Request,
  Response,
  NextFunction,
} from 'express';

@Injectable()
export class RequestAuditMiddleware implements NestMiddleware {

  private readonly logger = new Logger(RequestAuditMiddleware.name);

  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const auditData = {
      method: req.method,
      endpoint: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    this.logger.log(JSON.stringify(auditData));

    next();
  }
}
