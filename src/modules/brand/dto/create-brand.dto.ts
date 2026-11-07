import {
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
    IsUrl,
    Matches,
    IsMongoId,
} from 'class-validator';

export class CreateBrandDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    name: string;
}

export class ParamsBrandDto{
    @IsMongoId()
    @IsNotEmpty()
    id:string

}