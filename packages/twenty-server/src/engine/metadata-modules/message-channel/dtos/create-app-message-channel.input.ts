import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('CreateAppMessageChannelInput')
export class CreateAppMessageChannelInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  connectedAccountId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  handle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  // required: a default would silently decide for every app whether conversations are workspace-readable
  @Field(() => MessageChannelVisibility)
  @IsEnum(MessageChannelVisibility)
  @IsNotEmpty()
  visibility: MessageChannelVisibility;
}
