import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MAX_APP_MESSAGE_TEXT_LENGTH } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

// Same shape as sendEmail's input, for providers whose conversations are emails
@InputType('SendAppChannelMessageEmailInput')
export class SendAppChannelMessageEmailInput {
  // comma-separated handles
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

  // the email composer document, as sent to sendEmail
  @Field()
  @IsString()
  @IsNotEmpty()
  body: string;

  // headerMessageId of the message being replied to
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  inReplyTo?: string;
}

@InputType('SendAppChannelMessageInput')
export class SendAppChannelMessageInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;

  // exactly one of text and email
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text?: string;

  @Field(() => SendAppChannelMessageEmailInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SendAppChannelMessageEmailInput)
  email?: SendAppChannelMessageEmailInput;

  @Field(() => UUIDScalarType)
  @IsUUID()
  idempotencyKey: string;
}
