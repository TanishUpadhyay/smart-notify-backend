/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import { AuthProvider } from '../entity/userEntity';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean = false;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsEnum(AuthProvider)
  @IsOptional()
  authProvider?: AuthProvider;
}
