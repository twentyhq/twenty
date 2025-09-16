import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  position?: number;

  @Field(() => String, { nullable: true, defaultValue: 'Light' })
  @IsOptional()
  @IsString()
  colorScheme?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isEmailVerified = false;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  canImpersonate = true;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  canAdmin = false;

  @Field(() => String, { defaultValue: 'en' })
  @IsString()
  language = 'en';

  @Field(() => String, { nullable: true, defaultValue: null })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null = null;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  calendarStartDay?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  employmentStatusId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  organizationLevelId?: string;
}
