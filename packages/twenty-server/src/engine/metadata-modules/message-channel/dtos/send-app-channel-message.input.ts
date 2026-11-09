import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MAX_APP_MESSAGE_TEXT_LENGTH } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

@InputType('SendAppChannelMessageInput')
export class SendAppChannelMessageInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  messageThreadId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  idempotencyKey: string;
}
