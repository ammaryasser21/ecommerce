import { Module } from '@nestjs/common';
import { BrandService } from './brand.service.js';
import { BrandController } from './brand.controller.js';
import { BrandMongooseModule } from '../../models/brand.model.js';
import { BrandRepository } from '../../repository/brand.repository.js';
import { S3Module } from '../../common/modules/s3/s3.module.js';

@Module({
  imports: [
    BrandMongooseModule,
    S3Module

  ],
  controllers: [BrandController],
  providers: [
    BrandService,
    BrandRepository
  ],
  exports: [
    BrandService,
    BrandRepository
  ],
})
export class BrandModule { }
