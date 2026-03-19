import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateMessageFolderInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSentFolder?: boolean;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  externalId?: string;

  @IsEnum(MessageFolderPendingSyncAction)
  @IsNotEmpty()
  @Field(() => MessageFolderPendingSyncAction)
  pendingSyncAction: MessageFolderPendingSyncAction;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  messageChannelId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  parentFolderId?: string;
}
