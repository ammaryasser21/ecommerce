import {
    MongooseModule,
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Brand {

    @Prop({
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    })
    name: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    slug: string;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    image: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    createdBy: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
    })
    updatedBy: Types.ObjectId;

    @Prop({
        type: Date,
    })
    DeletedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

export const BrandMongooseModule = MongooseModule.forFeature([
    {
        name: Brand.name,
        schema: BrandSchema,
    },
]);