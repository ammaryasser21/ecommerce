
import { Types } from 'mongoose';
import { Role } from '../enums/role.js';


export interface IUser {
    fname: string;
    lname: string;
    email: string;
    username: string;
    password: string;
    phone?:string;
    role: Role;
    age?: number;
    changeCredentials?:Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?:Date;
}

export type UserDocument = IUser & {
    _id: Types.ObjectId;
};
