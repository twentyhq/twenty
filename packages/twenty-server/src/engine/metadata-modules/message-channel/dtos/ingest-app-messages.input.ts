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

// Only registered here: the role is stored as a SELECT on messageParticipant,
// so app ingestion is the first surface to expose it as a GraphQL enum.
registerEnumType(MessageParticipantRole, { name: 'MessageParticipantRole' });

// One request stays inside a single transaction and one logic-function
// timeout, so a provider backfill has to page rather than send everything.
export const INGEST_APP_MESSAGES_MAX_BATCH_SIZE = 100;

// Comfortably above a long plain-text conversation message, well below what
// would threaten the row or the transaction at full batch size.
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
}

@InputType('AppMessageInput')
export class AppMessageInput {
  // The provider's own id for this message. Re-ingesting the same externalId
  // updates nothing and creates nothing, so redelivered webhooks are safe.
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  externalId: string;

  // The provider's own id for the conversation. Messages sharing one land in
  // the same Message Thread.
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

  // Bounded like every other string here. One call is already 100 messages in
  // a single workspace transaction, and unlike email import nothing upstream
  // caps this, so an unbounded body would make the batch limit meaningless.
  @Field()
  @IsString()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  @Field(() => Date)
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
