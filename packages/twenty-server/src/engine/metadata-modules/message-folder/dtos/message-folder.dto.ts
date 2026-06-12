import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MessageFolder')
export class MessageFolderDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name: string | null;

  @HideField()
  syncCursor: string | null;

  @IsBoolean()
  @Field()
  isSentFolder: boolean;

  @IsBoolean()
  @Field()
  isSynced: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  parentFolderId: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  externalId: string | null;

  @IsEnum(MessageFolderPendingSyncAction)
  @IsNotEmpty()
  @Field(() => MessageFolderPendingSyncAction)
  pendingSyncAction: MessageFolderPendingSyncAction;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  messageChannelId: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
