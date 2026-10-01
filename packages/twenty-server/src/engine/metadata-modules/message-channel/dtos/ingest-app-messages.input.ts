import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MessageParticipantRole } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// stored as a SELECT on messageParticipant, so this is the first surface exposing it to GraphQL
registerEnumType(MessageParticipantRole, { name: 'MessageParticipantRole' });

// one request runs in a single transaction and logic-function timeout
export const INGEST_APP_MESSAGES_MAX_BATCH_SIZE = 100;

// above a long plain-text message, well below what would strain a full batch's transaction
export const MAX_APP_MESSAGE_TEXT_LENGTH = 262_144;

@InputType('AppMessageParticipantInput')
export class AppMessageParticipantInput {
  @Field(() => MessageParticipantRole)
  @IsEnum(MessageParticipantRole)
  @IsNotEmpty()
  role: MessageParticipantRole;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  handle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  // a non-email handle cannot be matched to a Person, so the caller links it here
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  personId?: string;

  // attribution only: thread targets come from personId alone, as for email
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  workspaceMemberId?: string;
}

@InputType('AppMessageInput')
export class AppMessageInput {
  // re-ingesting the same externalId is a no-op, so redelivered webhooks are safe
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  externalId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  threadExternalId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(998)
  subject?: string;

  // unlike email import, nothing upstream caps this
  @Field()
  @IsString()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  // GraphQL's DateTime scalar already yields a Date; this covers other scalar modes and non-GraphQL callers
  @Field(() => Date)
  @Type(() => Date)
  @IsDate()
  receivedAt: Date;

  @Field(() => [AppMessageParticipantInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  @ValidateNested({ each: true })
  @Type(() => AppMessageParticipantInput)
  participants: AppMessageParticipantInput[];
}

@InputType('IngestAppMessagesInput')
export class IngestAppMessagesInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  messageChannelId: string;

  @Field(() => [AppMessageInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(INGEST_APP_MESSAGES_MAX_BATCH_SIZE)
  @ValidateNested({ each: true })
  @Type(() => AppMessageInput)
  messages: AppMessageInput[];
}
