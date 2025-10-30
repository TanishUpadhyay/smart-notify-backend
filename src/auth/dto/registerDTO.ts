/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsPhoneNumber
} from 'class-validator';

export class RegisterDTO {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password is too long' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter'
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter'
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(50, { message: 'First name is too long' })
  firstName!: string;

  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name is too long' })
  lastName!: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Phone number is invalid' })
  phone?: string;
}
