import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateCalendarChannelInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(CalendarChannelVisibility)
  @IsNotEmpty()
  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;

  @IsEnum(CalendarChannelSyncStage)
  @IsNotEmpty()
  @Field(() => CalendarChannelSyncStage)
  syncStage: CalendarChannelSyncStage;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isContactAutoCreationEnabled?: boolean;

  @IsEnum(CalendarChannelContactAutoCreationPolicy)
  @IsOptional()
  @Field(() => CalendarChannelContactAutoCreationPolicy, { nullable: true })
  contactAutoCreationPolicy?: CalendarChannelContactAutoCreationPolicy;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSyncEnabled?: boolean;
}
