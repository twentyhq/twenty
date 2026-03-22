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
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateMessageChannelInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsEnum(MessageChannelVisibility)
  @IsNotEmpty()
  @Field(() => MessageChannelVisibility)
  visibility: MessageChannelVisibility;

  @IsEnum(MessageChannelType)
  @IsNotEmpty()
  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @IsEnum(MessageChannelSyncStage)
  @IsNotEmpty()
  @Field(() => MessageChannelSyncStage)
  syncStage: MessageChannelSyncStage;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  connectedAccountId: string;

  @IsBoolean()
  @IsNotEmpty()
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
  @IsNotEmpty()
  @Field()
  excludeNonProfessionalEmails: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  excludeGroupEmails: boolean;

  @IsEnum(MessageChannelPendingGroupEmailsAction)
  @IsNotEmpty()
  @Field(() => MessageChannelPendingGroupEmailsAction)
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isSyncEnabled: boolean;
}
