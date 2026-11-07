import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from './base.repository.js';
import { Category } from '../models/category.model.js';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {

    constructor(
        @InjectModel(Category.name)
        categoryModel: Model<Category>,
    ) {
        super(categoryModel);
    }

}