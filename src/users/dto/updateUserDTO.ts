/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  username?: string;

  @IsOptional()
  profileImage?: string;
}
