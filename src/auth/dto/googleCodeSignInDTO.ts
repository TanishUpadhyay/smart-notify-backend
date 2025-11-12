import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleAuthCodeLoginDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
