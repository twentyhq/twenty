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
import { CastToStringArray } from 'src/integrations/environment/decorators/cast-to-string-array.decorator';
import { ExceptionHandlerDriver } from 'src/integrations/exception-handler/interfaces';
import { StorageDriverType } from 'src/integrations/file-storage/interfaces';
import { LoggerDriverType } from 'src/integrations/logger/interfaces';
import { IsStrictlyLowerThan } from 'src/integrations/environment/decorators/is-strictly-lower-than.decorator';

import { IsDuration } from './decorators/is-duration.decorator';
import { AwsRegion } from './interfaces/aws-region.interface';
import { IsAWSRegion } from './decorators/is-aws-region.decorator';
import { CastToBoolean } from './decorators/cast-to-boolean.decorator';
import { SupportDriver } from './interfaces/support.interface';
import { CastToPositiveNumber } from './decorators/cast-to-positive-number.decorator';
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
  IS_BILLING_ENABLED?: boolean;

  @IsOptional()
  @IsString()
  BILLING_URL?: string;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ENABLED?: boolean;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  TELEMETRY_ANONYMIZATION_ENABLED?: boolean;

  @CastToPositiveNumber()
  @IsNumber()
  @IsOptional()
  PORT: number;

  // Database
  @IsUrl({ protocols: ['postgres'], require_tld: false, allow_underscores: true })
  PG_DATABASE_URL: string;

  // Frontend URL
  @IsUrl({ require_tld: false })
  FRONT_BASE_URL: string;

  // Server URL
  @IsUrl({ require_tld: false })
  @IsOptional()
  SERVER_URL: string;

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
  @IsEnum(StorageDriverType)
  @IsOptional()
  STORAGE_TYPE?: StorageDriverType;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsAWSRegion()
  STORAGE_S3_REGION?: AwsRegion;

  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.S3)
  @IsString()
  STORAGE_S3_NAME?: string;

  @IsString()
  @ValidateIf((env) => env.STORAGE_TYPE === StorageDriverType.Local)
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

  @IsEnum(LoggerDriverType)
  @IsOptional()
  LOGGER_DRIVER?: LoggerDriverType;

  @IsEnum(ExceptionHandlerDriver)
  @IsOptional()
  EXCEPTION_HANDLER_DRIVER?: ExceptionHandlerDriver;

  @CastToLogLevelArray()
  @IsOptional()
  LOG_LEVELS?: LogLevel[];

  @CastToStringArray()
  @IsOptional()
  DEMO_WORKSPACE_IDS?: string[];

  @ValidateIf(
    (env) => env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry,
  )
  @IsString()
  SENTRY_DSN?: string;

  @IsDuration()
  @IsOptional()
  PASSWORD_RESET_TOKEN_EXPIRES_IN?: number;

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  @IsStrictlyLowerThan('WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION', {
    message:
      '"WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION" should be strictly lower that "WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION"',
  })
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION: number;

  @CastToPositiveNumber()
  @IsNumber()
  @ValidateIf((env) => env.WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION > 0)
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION: number;

  @CastToBoolean()
  @IsOptional()
  @IsBoolean()
  IS_SIGN_UP_DISABLED?: boolean;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);

  assert(!errors.length, errors.toString());

  return validatedConfig;
};
