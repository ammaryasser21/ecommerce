import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
} from '@nestjs/common';

import { BrandService } from './brand.service.js';
import { CreateBrandDto, ParamsBrandDto } from './dto/create-brand.dto.js';

import { Auth } from '../../common/decorators/auth.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

import { Role } from '../../common/enums/role.js';
import { tokenTypes } from '../../common/enums/token.js';

import type { UserDocument } from '../../models/user.model.js';

import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor.js';
import { CloudUpload } from '../../common/decorators/upload.decorator.js';
import { STORAGE_TYPES } from '../../common/enums/multer.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';

@UseInterceptors(LoggingInterceptor)
@Controller('brands')
export class BrandController {

  constructor(
    private readonly brandService: BrandService,
  ) { }

  @Auth({
    roles: [Role.ADMIN],
    tokenType: tokenTypes.ACCESS,
  })
  @CloudUpload('img', {
    storageType: STORAGE_TYPES.MEMORY,
    folder: 'brands',
  })
  @Post()
  create(
    @Body() data: CreateBrandDto,
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File

  ) {
    return this.brandService.create(data, user, file);
  }



  @Auth({
    roles: [Role.ADMIN],
    tokenType: tokenTypes.ACCESS,
  })
  @CloudUpload('img', {
    storageType: STORAGE_TYPES.MEMORY,
    folder: 'brands',
  })
  @Patch(':id')
  update(
    @Param('id') { id }: ParamsBrandDto,
    @Body() data: UpdateBrandDto,
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File

  ) {
    return this.brandService.update(id,data,user,file);
  }
}