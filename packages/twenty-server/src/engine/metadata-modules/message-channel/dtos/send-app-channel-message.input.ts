import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE,
  MAX_APP_MESSAGE_TEXT_LENGTH,
} from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

@InputType('SendAppChannelMessageAttachmentInput')
export class SendAppChannelMessageAttachmentInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

@InputType('SendAppChannelMessageInput')
export class SendAppChannelMessageInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;

  // may be empty when attachments are sent; the service requires one of the two
  @Field()
  @IsString()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  idempotencyKey: string;

  @Field(() => [SendAppChannelMessageAttachmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE)
  @ValidateNested({ each: true })
  @Type(() => SendAppChannelMessageAttachmentInput)
  attachments?: SendAppChannelMessageAttachmentInput[];
}
