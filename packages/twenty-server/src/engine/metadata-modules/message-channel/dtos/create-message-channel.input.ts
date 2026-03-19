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
  @IsOptional()
  @Field({ nullable: true })
  isContactAutoCreationEnabled?: boolean;

  @IsEnum(MessageChannelContactAutoCreationPolicy)
  @IsOptional()
  @Field(() => MessageChannelContactAutoCreationPolicy, { nullable: true })
  contactAutoCreationPolicy?: MessageChannelContactAutoCreationPolicy;

  @IsEnum(MessageFolderImportPolicy)
  @IsOptional()
  @Field(() => MessageFolderImportPolicy, { nullable: true })
  messageFolderImportPolicy?: MessageFolderImportPolicy;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSyncEnabled?: boolean;
}
