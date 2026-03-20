import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateMessageFolderInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  syncCursor?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isSynced?: boolean;

  @IsOptional()
  @IsEnum(MessageFolderPendingSyncAction)
  @Field(() => MessageFolderPendingSyncAction, { nullable: true })
  pendingSyncAction?: MessageFolderPendingSyncAction;
}

@InputType()
export class UpdateMessageFolderInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateMessageFolderInputUpdates)
  @ValidateNested()
  @Field(() => UpdateMessageFolderInputUpdates)
  update: UpdateMessageFolderInputUpdates;
}
