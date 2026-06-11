import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateCalendarChannelInputUpdates {
  @IsOptional()
  @IsEnum(CalendarChannelVisibility)
  @Field(() => CalendarChannelVisibility, { nullable: true })
  visibility?: CalendarChannelVisibility;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isContactAutoCreationEnabled?: boolean;

  @IsOptional()
  @IsEnum(CalendarChannelContactAutoCreationPolicy)
  @Field(() => CalendarChannelContactAutoCreationPolicy, { nullable: true })
  contactAutoCreationPolicy?: CalendarChannelContactAutoCreationPolicy;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isSyncEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  syncedCategories?: string[];
}

@InputType()
export class UpdateCalendarChannelInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateCalendarChannelInputUpdates)
  @ValidateNested()
  @Field(() => UpdateCalendarChannelInputUpdates)
  update: UpdateCalendarChannelInputUpdates;
}
