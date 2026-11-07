import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis';

import { createClient } from 'redis';

import {
  DeleteManyParams,
  DeleteParams,
  ExistsParams,
  ExpireParams,
  GetParams,
  KeysParams,
  SetParams,
  SetTokenParams,
  TokenParams,
} from '../../interface/redis.interface.js';
import { REDIS_CLIENT } from './redis.module.js';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
  ) { }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient.isOpen) {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    }
  }

  // ==================== Basic Operations ====================

  async get({ key }: GetParams): Promise<unknown | null> {
    const result = await this.redisClient.get(key);

    if (result === null) {
      return null;
    }

    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  async set({ key, value, ttl }: SetParams): Promise<void> {
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (serializedValue === undefined) {
      throw new TypeError('Redis value cannot be serialized');
    }

    if (ttl !== undefined) {
      await this.redisClient.set(key, serializedValue, {
        EX: ttl,
      });
      return;
    }

    await this.redisClient.set(key, serializedValue);
  }

  async delete({ key }: DeleteParams): Promise<number> {
    return this.redisClient.del(key);
  }

  async deleteMany({ keys }: DeleteManyParams): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    return this.redisClient.del(keys);
  }

  async exists({ key }: ExistsParams): Promise<number> {
    return this.redisClient.exists(key);
  }

  async expire({ key, seconds }: ExpireParams): Promise<number> {
    return this.redisClient.expire(key, seconds);
  }

  async ttl({ key }: GetParams): Promise<number> {
    return this.redisClient.ttl(key);
  }

  // ==================== Counter Operations ====================

  async incr({ key }: GetParams): Promise<number> {
    return this.redisClient.incr(key);
  }

  async incrWithExpire({
    key,
    ttl,
  }: {
    key: string;
    ttl: number;
  }): Promise<number> {
    const totalHits = await this.redisClient.incr(key);

    if (totalHits === 1) {
      await this.redisClient.expire(key, ttl);
    }

    return totalHits;
  }

  async decr({ key }: GetParams): Promise<number> {
    return this.redisClient.decr(key);
  }

  // ==================== Token Operations ====================

  async getToken({ userId, tokenSigniture }: TokenParams) {
    return this.get({
      key: this.createTokenKey({ userId, tokenSigniture }),
    });
  }

  async setToken({
    userId,
    tokenSigniture,
    value,
    ttl,
  }: SetTokenParams): Promise<void> {
    const params: SetParams = {
      key: this.createTokenKey({ userId, tokenSigniture }),
      value,
      ...(ttl !== undefined ? { ttl } : {}),
    };

    return this.set(params);
  }

  async deleteToken({
    userId,
    tokenSigniture,
  }: TokenParams): Promise<number> {
    return this.delete({
      key: this.createTokenKey({ userId, tokenSigniture }),
    });
  }

  async deleteAllTokens({
    userId,
  }: {
    userId: string;
  }): Promise<number> {
    const keys = await this.keys({
      prefix: this.prefixTokenKey({ userId }),
    });

    return this.deleteMany({ keys });
  }

  async tokenExists({
    userId,
    tokenSigniture,
  }: TokenParams): Promise<number> {
    return this.exists({
      key: this.createTokenKey({ userId, tokenSigniture }),
    });
  }

  // ==================== Key Operations ====================

  async keys({ prefix }: KeysParams): Promise<string[]> {
    return this.redisClient.keys(`${prefix}*`);
  }

  prefixTokenKey = ({ userId }: { userId: string }): string =>
    `TOKEN::${userId}`;

  createTokenKey = ({
    userId,
    tokenSigniture,
  }: TokenParams): string =>
    `TOKEN::${userId}::${tokenSigniture}`;

  // ==================== OTP Keys ====================

  otpKey = ({ email }: { email: string }): string =>
    `OTP::${email}`;

  otpCountKey = ({ email }: { email: string }): string =>
    `OTP::COUNT::${email}`;

  forgetOtpKey = ({ email }: { email: string }): string =>
    `OTP::FORGET_PASSWORD::${email}`;

  forgetOtpRequestCountKey = ({ email }: { email: string }): string =>
    `OTP::FORGET_PASSWORD::REQUEST_COUNT::${email}`;

  forgetOtpAttemptCountKey = ({ email }: { email: string }): string =>
    `OTP::FORGET_PASSWORD::ATTEMPT_COUNT::${email}`;

  forgetTokenKey = ({ token }: { token: string }): string =>
    `TOKEN::FORGET_PASSWORD::${token}`;

  forgetTokenCountKey = ({ email }: { email: string }): string =>
    `TOKEN::FORGET_PASSWORD::COUNT::${email}`;

  // ==================== FCM Token Operations ====================

  FCMTokenKey = (userId: string): string => `FCM::${userId}`;

  async setFCMToken(userId: string, token: string): Promise<number> {
    return this.redisClient.sAdd(this.FCMTokenKey(userId), token);
  }

  async getFCMToken(userId: string): Promise<string[]> {
    return this.redisClient.sMembers(this.FCMTokenKey(userId));
  }

  async deleteFCMToken(
    userId: string,
    token: string,
  ): Promise<number> {
    return this.redisClient.sRem(this.FCMTokenKey(userId), token);
  }

  // ==================== Socket Operations ====================

  SocketKey = (userId: string): string => `SOCKET::${userId}`;

  async setSocket(userId: string, socketId: string): Promise<number> {
    return this.redisClient.sAdd(this.SocketKey(userId), socketId);
  }

  async getSocket(userId: string): Promise<string[]> {
    return this.redisClient.sMembers(this.SocketKey(userId));
  }

  async deleteSocket(
    userId: string,
    socketId: string,
  ): Promise<number> {
    return this.redisClient.sRem(this.SocketKey(userId), socketId);
  }
}
