import {
    MongooseModule,
    Prop,
    Schema,
    SchemaFactory,
    Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../common/enums/role.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityService } from '../common/modules/security/security.service.js';
import { SecurityModule } from '../common/modules/security/security.module.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version',
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class User {
    @Prop({
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    })
    fname: string;

    @Prop({
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    })
    lname: string;

    @Prop({
        type: Number,
        min: 1,
        max: 120,
    })
    age: number;


    @Prop({
        type: String,
        min: 10,
        max: 12,
    })
    phone: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    email: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    })
    username: string;

    @Prop({
        type: String,
        required: true,
        minlength: 8,
        select: false,
    })
    password: string;

    @Prop({
        type: String,
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Prop({
        type:Date
    })
    changeCredentials:Date

    @Virtual({
        get: function (this: User) {
            return `${this.fname} ${this.lname}`;
        },
    })
    fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserMongooseModule = MongooseModule.forFeatureAsync([
    {
        name: User.name,
        useFactory: (
            configService: ConfigService,
            securityService: SecurityService
        ) => {
            UserSchema.pre('save', async function () {
                if (this.isModified('password'))
                    this.password = await securityService.hashValue(this.password);
                if (this.phone && this.isModified('phone'))
                    this.phone = await securityService.encrypt(this.phone);
            });
            UserSchema.post('save', () => {
                console.log('post save');
            });
            return UserSchema;
        },
        imports: [
            ConfigModule,
            SecurityModule
        ],
        inject: [
            ConfigService,
            SecurityService
        ]
    },
]);