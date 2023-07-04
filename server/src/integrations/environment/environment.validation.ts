import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { assert } from 'src/utils/assert';
import { IsDuration } from './decorators/is-duration.decorator';
import { StorageType } from './interfaces/storage.interface';
import { AwsRegion } from './interfaces/aws-region.interface';
import { IsAWSRegion } from './decorators/is-aws-region.decorator';

export class EnvironmentVariables {
  // Database
  @IsUrl({ protocols: ['postgres'], require_tld: false })
  PG_DATABASE_URL: string;

  // Json Web Token
  @IsString()
  ACCESS_TOKEN_SECRET: string;
  @IsDuration()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;
  @IsDuration()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  LOGIN_TOKEN_SECRET: string;
  @IsDuration()
  LOGIN_TOKEN_EXPIRES_IN: string;

  // Auth
  @IsUrl({ require_tld: false })
  FRONT_AUTH_CALLBACK_URL: string;

  @IsString()
  @IsOptional()
  AUTH_GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  AUTH_GOOGLE_CLIENT_SECRET?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  AUTH_GOOGLE_CALLBACK_URL?: string;

  // Storage
  @IsEnum(StorageType)
  @IsOptional()
  STORAGE_TYPE?: StorageType;

  @ValidateIf((_, value) => value === StorageType.S3)
  @IsAWSRegion()
  STORAGE_REGION?: AwsRegion;

  @IsString()
  STORAGE_LOCATION: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
