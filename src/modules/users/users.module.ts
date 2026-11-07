import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserMongooseModule } from '../../models/user.model.js';
import { S3Module } from '../../common/modules/s3/s3.module.js';

@Module({
  imports: [
    UserMongooseModule,
    S3Module
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
