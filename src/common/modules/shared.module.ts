import { Global, Module } from "@nestjs/common";
import { UserMongooseModule } from "../../models/user.model.js";
import { RedisModule } from "./redis/redis.module.js";
import { SecurityModule } from "./security/security.module.js";
import { JwtModule } from "@nestjs/jwt";
import { EmailModule } from "./email/email.module.js";
import { UserRepository } from "../../repository/user.repository.js";
import { TokenService } from "../service/token.service.js";
import { RedisService } from "./redis/redis.service.js";
import { SecurityService } from "./security/security.service.js";

@Global()
@Module({

  imports: [
    UserMongooseModule,
    RedisModule,
    SecurityModule,
    EmailModule,
    JwtModule
  ],

  providers: [
    UserRepository,
    TokenService,
    SecurityService
  ],

  exports: [
    UserRepository,
    TokenService,
    SecurityService,
    RedisModule
  ]

})
export class SharedModule { }