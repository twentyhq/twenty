import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateMessageChannelInputUpdates {
  @IsOptional()
  @IsEnum(MessageChannelVisibility)
  @Field(() => MessageChannelVisibility, { nullable: true })
  visibility?: MessageChannelVisibility;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isContactAutoCreationEnabled?: boolean;

  @IsOptional()
  @IsEnum(MessageChannelContactAutoCreationPolicy)
  @Field(() => MessageChannelContactAutoCreationPolicy, { nullable: true })
  contactAutoCreationPolicy?: MessageChannelContactAutoCreationPolicy;

  @IsOptional()
  @IsEnum(MessageFolderImportPolicy)
  @Field(() => MessageFolderImportPolicy, { nullable: true })
  messageFolderImportPolicy?: MessageFolderImportPolicy;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isSyncEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  excludeNonProfessionalEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  excludeGroupEmails?: boolean;
}

@InputType()
export class UpdateMessageChannelInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateMessageChannelInputUpdates)
  @ValidateNested()
  @Field(() => UpdateMessageChannelInputUpdates)
  update: UpdateMessageChannelInputUpdates;
}
