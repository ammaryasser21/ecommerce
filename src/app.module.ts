import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { DatabaseModule } from './common/modules/mongoose.module.js';
import { RedisModule } from './common/modules/redis/redis.module.js';
import { AuthorizeGuard } from './common/guards/authorization.guard.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { SharedModule } from './common/modules/shared.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { BrandModule } from './modules/brand/brand.module.js';
import { CategoryModule } from './modules/category/category.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    ProductsModule,
    AuthModule,
    RedisModule,
    SharedModule,
    BrandModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }
