import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  AppMessageAttachmentInput,
  MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE,
  MAX_APP_MESSAGE_TEXT_LENGTH,
} from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

@InputType('SendAppChannelMessageInput')
export class SendAppChannelMessageInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;

  // may be empty when the message only carries attachments
  @Field()
  @IsString()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  @Field(() => [AppMessageAttachmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE)
  @ValidateNested({ each: true })
  @Type(() => AppMessageAttachmentInput)
  attachments?: AppMessageAttachmentInput[];

  @Field(() => UUIDScalarType)
  @IsUUID()
  idempotencyKey: string;
}
