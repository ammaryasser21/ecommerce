
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';

import type { UserDocument } from '../../models/user.model.js';
import { BrandRepository } from '../../repository/brand.repository.js';
import { S3Service } from '../../common/modules/s3/s3.service.js';

@Injectable()
export class BrandService {

  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
  ) { }

  async create(
    data: CreateBrandDto,
    user: UserDocument,
    file?: Express.Multer.File,
  ) {
    const { name } = data;

    const existBrand = await this.brandRepo.findOne({
      name,
    });

    if (existBrand) {
      throw new ConflictException('Brand name already exists');
    }

    if (!file) {
      throw new BadRequestException('Brand image is required');
    }

    const imageUrl = await this.s3Service.uploadFile({
      file,
      folder: 'brand',
      path: 'brand',
    });

    try {
      const brand = await this.brandRepo.create({
        name,
        image: imageUrl,
        createdBy: user._id,
        updatedBy: user._id,
      });

      if (!brand) {
        throw new BadRequestException('Failed to create brand');
      }

      return brand;

    } catch (error) {
      await this.s3Service.deleteFile({
        fileName: imageUrl,
      });

      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateBrandDto,
    user: UserDocument,
    file?: Express.Multer.File,
  ) {

    const brand = await this.brandRepo.findById(id);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (data.name && data.name !== brand.name) {

      const existBrand = await this.brandRepo.findOne({
        name: data.name,
        _id: { $ne: id },
      });

      if (existBrand) {
        throw new ConflictException('Brand name already exists');
      }
    }

    let imageUrl = brand.image;

    if (file) {
      imageUrl = await this.s3Service.uploadFile({
        file,
        folder: 'brand',
        path: 'brand',
      });
    }

    try {

      const updatedBrand = await this.brandRepo.findOneAndUpdate(
        { _id: id },
        {
          ...data,
          image: imageUrl,
          updatedBy: user._id,
        },
      );

      if (!updatedBrand) {
        throw new BadRequestException('Failed to update brand');
      }

      if (file) {
        await this.s3Service.deleteFile({
          fileName: brand.image,
        });
      }

      return updatedBrand;

    } catch (error) {

      if (file) {
        await this.s3Service.deleteFile({
          fileName: imageUrl,
        });
      }

      throw error;
    }
  }
}
