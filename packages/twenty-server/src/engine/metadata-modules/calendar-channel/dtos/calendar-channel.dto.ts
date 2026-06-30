import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('CalendarChannel')
export class CalendarChannelDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(CalendarChannelSyncStatus)
  @IsNotEmpty()
  @Field(() => CalendarChannelSyncStatus)
  syncStatus: CalendarChannelSyncStatus;

  @IsEnum(CalendarChannelSyncStage)
  @IsNotEmpty()
  @Field(() => CalendarChannelSyncStage)
  syncStage: CalendarChannelSyncStage;

  @IsEnum(CalendarChannelVisibility)
  @IsNotEmpty()
  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;

  @IsBoolean()
  @Field()
  isContactAutoCreationEnabled: boolean;

  @IsEnum(CalendarChannelContactAutoCreationPolicy)
  @IsNotEmpty()
  @Field(() => CalendarChannelContactAutoCreationPolicy)
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;

  @IsBoolean()
  @Field()
  isSyncEnabled: boolean;

  @HideField()
  syncCursor: string | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  syncedAt: Date | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  syncStageStartedAt: Date | null;

  @IsInt()
  @Field()
  throttleFailureCount: number;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
