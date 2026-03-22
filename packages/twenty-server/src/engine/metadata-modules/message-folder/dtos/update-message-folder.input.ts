import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateMessageFolderInputUpdates {
  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isSynced?: boolean;
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

@InputType()
export class UpdateMessageFoldersInput {
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  @Field(() => [UUIDScalarType])
  ids: string[];

  @Type(() => UpdateMessageFolderInputUpdates)
  @ValidateNested()
  @Field(() => UpdateMessageFolderInputUpdates)
  update: UpdateMessageFolderInputUpdates;
}
