import { Field, InputType } from '@nestjs/graphql';

import { ArrayNotEmpty, IsArray, IsBoolean, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateMessageFoldersSyncStatusInput {
  @IsUUID('4')
  @Field(() => UUIDScalarType)
  messageChannelId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @Field(() => [UUIDScalarType])
  messageFolderIds: string[];

  @IsBoolean()
  @Field(() => Boolean)
  isSynced: boolean;
}
