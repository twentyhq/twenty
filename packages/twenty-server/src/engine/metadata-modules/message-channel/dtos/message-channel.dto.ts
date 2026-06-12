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
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MessageChannel')
export class MessageChannelDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsEnum(MessageChannelVisibility)
  @IsNotEmpty()
  @Field(() => MessageChannelVisibility)
  visibility: MessageChannelVisibility;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(MessageChannelType)
  @IsNotEmpty()
  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @IsBoolean()
  @Field()
  isContactAutoCreationEnabled: boolean;

  @IsEnum(MessageChannelContactAutoCreationPolicy)
  @IsNotEmpty()
  @Field(() => MessageChannelContactAutoCreationPolicy)
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @IsEnum(MessageFolderImportPolicy)
  @IsNotEmpty()
  @Field(() => MessageFolderImportPolicy)
  messageFolderImportPolicy: MessageFolderImportPolicy;

  @IsBoolean()
  @Field()
  excludeNonProfessionalEmails: boolean;

  @IsBoolean()
  @Field()
  excludeGroupEmails: boolean;

  @IsEnum(MessageChannelPendingGroupEmailsAction)
  @IsNotEmpty()
  @Field(() => MessageChannelPendingGroupEmailsAction)
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;

  @IsBoolean()
  @Field()
  isSyncEnabled: boolean;

  @HideField()
  syncCursor: string | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  syncedAt: Date | null;

  @IsEnum(MessageChannelSyncStatus)
  @IsNotEmpty()
  @Field(() => MessageChannelSyncStatus)
  syncStatus: MessageChannelSyncStatus;

  @IsEnum(MessageChannelSyncStage)
  @IsNotEmpty()
  @Field(() => MessageChannelSyncStage)
  syncStage: MessageChannelSyncStage;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  syncStageStartedAt: Date | null;

  @IsInt()
  @Field()
  throttleFailureCount: number;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  throttleRetryAfter: Date | null;

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
