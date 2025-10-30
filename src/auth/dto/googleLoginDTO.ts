/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  picture: string;
}
