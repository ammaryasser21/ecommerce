import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from './base.repository.js';
import { Brand } from '../models/brand.model.js';

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {

    constructor(
        @InjectModel(Brand.name)
        brandModel: Model<Brand>,
    ) {
        super(brandModel);
    }

}