
import {
  Global,
  Logger,
  Module,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

import { RedisService } from './redis.service.js';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');

        const client = createClient({
          url: configService.getOrThrow<string>('REDIS_URL'),
        });

        client.on('error', (error) => {
          logger.error('Redis client error', error);
        });

        client.on('connect', () => {
          logger.log('Redis connected successfully ...');
        });

        await client.connect();

        return client;
      },
    },
    RedisService,
  ],

  exports: [RedisService],
})
export class RedisModule {}
