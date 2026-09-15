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

  // Deliberately required: a default here would decide, silently and for
  // every app, whether one member's conversations are readable by the whole
  // workspace. The app author knows which its provider's messages are.
  @Field(() => MessageChannelVisibility)
  @IsEnum(MessageChannelVisibility)
  @IsNotEmpty()
  visibility: MessageChannelVisibility;
}
