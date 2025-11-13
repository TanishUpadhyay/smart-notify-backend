import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateEventDTO {
  @Expose()
  @IsNotEmpty()
  @IsString()
  source: string; // e.g., "gmail","github" etc.

  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsString()
  link?: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @Expose()
  @IsOptional()
  eventDate?: Date;

  @Expose()
  @IsNotEmpty()
  @IsString()
  content: string;
}
