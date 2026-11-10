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
  AppMessageAttachmentInput,
  MAX_APP_MESSAGE_ATTACHMENTS_PER_MESSAGE,
  MAX_APP_MESSAGE_TEXT_LENGTH,
} from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { ExactlyOneOf } from 'src/engine/metadata-modules/view-field-group/dtos/validators/exactly-one-of.validator';

@InputType('SendAppChannelMessageEmailInput')
export class SendAppChannelMessageEmailInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  to: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bcc?: string;

  @Field()
  @IsString()
  @MaxLength(998)
  subject: string;

  @Field()
  @IsString()
  body: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  inReplyTo?: string;
}

@InputType('SendAppChannelMessageInput')
@ExactlyOneOf(['text', 'email'])
export class SendAppChannelMessageInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;

  // may be empty when a chat reply only carries attachments
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text?: string;

  @Field(() => SendAppChannelMessageEmailInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SendAppChannelMessageEmailInput)
  email?: SendAppChannelMessageEmailInput;

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
