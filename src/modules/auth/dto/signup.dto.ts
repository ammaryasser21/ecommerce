import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsLowercase,
  IsAlphanumeric,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

import { Match } from '../../../common/decorators/match.decorator.js';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  fname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  lname: string;

  @IsInt()
  @Min(1)
  @Max(120)
  age: number;

  @IsString()
  @Min(10)
  @Max(12)
  @IsOptional()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @IsAlphanumeric()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;
}