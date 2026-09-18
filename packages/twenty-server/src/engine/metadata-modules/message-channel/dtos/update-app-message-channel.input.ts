import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('UpdateAppMessageChannelInput')
export class UpdateAppMessageChannelInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  // An omitted displayName leaves the current one untouched; an explicit null clears it
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string | null;

  @Field(() => MessageChannelVisibility, { nullable: true })
  @IsOptional()
  @IsEnum(MessageChannelVisibility)
  visibility?: MessageChannelVisibility;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSyncEnabled?: boolean;
}
