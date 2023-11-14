import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @Field()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @Field()
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @Field()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field()
  @IsString()
  @IsOptional()
  locale?: string;

  @Field()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field()
  @IsOptional()
  @IsString()
  passwordHash?: string;

  @Field()
  @IsOptional()
  @IsDate()
  lastSeen?: Date;
}
