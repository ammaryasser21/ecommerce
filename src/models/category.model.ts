import {
    MongooseModule,
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Category {

  
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategoryMongooseModule = MongooseModule.forFeature([
    {
        name: Category.name,
        schema: CategorySchema,
    },
]);