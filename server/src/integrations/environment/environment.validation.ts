import { LogLevel } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
  IsBoolean,
  IsNumber,
} from 'class-validator';

import { assert } from 'src/utils/assert';

import { IsDuration } from './decorators/is-duration.decorator';
import { StorageType } from './interfaces/storage.interface';
import { AwsRegion } from './interfaces/aws-region.interface';
import { IsAWSRegion } from './decorators/is-aws-region.decorator';
import { CastToBoolean } from './decorators/cast-to-boolean.decorator';
import { SupportDriver } from './interfaces/support.interface';
import { CastToPositiveNumber } from './decorators/cast-to-positive-number.decorator';
import { LoggerDriver } from './interfaces/logger.interface';
import { CastToLogLevelArray } from './decorators/cast-to-log-level-array.decorator';

export class EnvironmentVariables {
  // Misc
  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  DEBUG_MODE?: boolean;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  SIGN_IN_PREFILLED?: boolean;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED?: boolean;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ANONYMIZATION_ENABLED?: boolean;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  FLEXIBLE_BACKEND_ENABLED?: boolean;

  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT: number;

  // Database
  @IsUrl({ protocols: ['postgres'], require_tld: false })
  PG_DATABASE_URL: string;

  // Frontend URL
  @IsUrl({ require_tld: false })
  FRONT_BASE_URL: string;

  // Json Web Token
  @IsString()
  ACCESS_TOKEN_SECRET: string;
  @IsDuration()
  @IsOptional()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN: string;
  @IsDuration()
  @IsOptional()
  REFRESH_TOKEN_COOL_DOWN: string;

  @IsString()
  LOGIN_TOKEN_SECRET: string;
  @IsString()
  API_TOKEN_SECRET: string;
  @IsDuration()
  @IsOptional()
  LOGIN_TOKEN_EXPIRES_IN: string;

  // Auth
  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONT_AUTH_CALLBACK_URL: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  AUTH_GOOGLE_ENABLED?: boolean;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CLIENT_ID?: string;

  @IsString()
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CLIENT_SECRET?: string;

  @IsUrl({ require_tld: false })
  @ValidateIf((env) => env.AUTH_GOOGLE_ENABLED === true)
  AUTH_GOOGLE_CALLBACK_URL?: string;

  // Storage
  @IsEnum(StorageType)
  @IsOptional()
  STORAGE_TYPE?: StorageType;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION?: AwsRegion;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.S3)
  @IsString()
  STORAGE_S3_NAME?: string;

  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageType.Local)
  STORAGE_LOCAL_PATH?: string;

  // Support
  @IsEnum(SupportDriver)
  @IsOptional()
  SUPPORT_DRIVER?: SupportDriver;

  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_CHAT_ID?: string;

  @ValidateIf((env) => env.SUPPORT_DRIVER === SupportDriver.Front)
  @IsString()
  SUPPORT_FRONT_HMAC_KEY?: string;

  @IsEnum(LoggerDriver)
  @IsOptional()
  LOGGER_DRIVER?: LoggerDriver;

  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS?: LogLevel[];

  @ValidateIf((env) => env.LOGGER_DRIVER === LoggerDriver.Sentry)
  @IsString()
  SENTRY_DSN?: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
};
