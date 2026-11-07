import { Types } from 'mongoose';
import { IUser } from './user.interface.js';
export interface IBrand {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    image: string;
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;
    createdAt?: Date;
    updatedAt?: Date;
    DeletedAt?: Date;
}