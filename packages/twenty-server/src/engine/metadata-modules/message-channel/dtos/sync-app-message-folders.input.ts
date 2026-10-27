import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const SYNC_APP_MESSAGE_FOLDERS_MAX_FOLDERS = 1_000;

@InputType('AppMessageFolderInput')
export class AppMessageFolderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  externalId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSynced?: boolean;
}

@InputType('SyncAppMessageFoldersInput')
export class SyncAppMessageFoldersInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  messageChannelId: string;

  @Field(() => [AppMessageFolderInput])
  @IsArray()
  @ArrayMaxSize(SYNC_APP_MESSAGE_FOLDERS_MAX_FOLDERS)
  @ValidateNested({ each: true })
  @Type(() => AppMessageFolderInput)
  folders: AppMessageFolderInput[];
}
