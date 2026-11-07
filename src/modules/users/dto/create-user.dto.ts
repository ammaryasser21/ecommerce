import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';

import { Role } from '../../../common/enums/role.js';
import { Match } from '../../../common/decorators/match.decorator.js';
import { confirmPassword } from '../../../common/validators/match-password.validator.js';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
//@Validate(confirmPassword)
  @Match('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}