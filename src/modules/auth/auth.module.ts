import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserMongooseModule } from '../../models/user.model.js';
import { UserRepository } from '../../repository/user.repository.js';
import { SecurityService } from '../../common/modules/security/security.service.js';
import { RedisModule } from '../../common/modules/redis/redis.module.js';
import { SecurityModule } from '../../common/modules/security/security.module.js';
import { EmailModule } from '../../common/modules/email/email.module.js';
import { RequestAuditMiddleware } from '../../middleware/request-audit.middleware.js';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '../../common/service/token.service.js';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestAuditMiddleware)
      .forRoutes(AuthController);
  }

}
