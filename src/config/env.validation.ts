/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  //   @IsNumber()
  //   PORT: number;

  //   @IsString()
  //   POSTGRES_HOST: string;

  //   @IsNumber()
  //   POSTGRES_PORT: number;

  //   @IsString()
  //   POSTGRES_USER: string;

  //   @IsString()
  //   POSTGRES_PASSWORD: string;

  //   @IsString()
  //   POSTGRES_DB: string;

  //   @IsString()
  //   REDIS_HOST: string;

  //   @IsNumber()
  //   REDIS_PORT: number;

  @IsString()
  JWT_SECRET: string;

  //   @IsString()
  //   JWT_EXPIRES_IN: string;

  //   @IsString()
  //   AWS_REGION: string;

  //   @IsString()
  //   AWS_PUBLIC_BUCKET: string;

  //   @IsString()
  //   AWS_PRIVATE_BUCKET: string;

  //   @IsString()
  //   CDN_HOST: string;

  //   @IsString()
  //   AWS_ACCESS_KEY_ID: string;

  //   @IsString()
  //   AWS_SECRET_ACCESS_KEY: string;

  //   @IsString()
  //   AWS_SES_FROM_EMAIL: string;

  //   @IsString()
  //   FRONTEND_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
