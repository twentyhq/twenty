import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MAX_APP_MESSAGE_TEXT_LENGTH } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';

@InputType('StartAppChannelConversationInput')
export class StartAppChannelConversationInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  messageChannelId: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  personId: string;

  @Field()
  @IsString()
  @Matches(/\S/, { message: 'text must not be blank' })
  @MaxLength(MAX_APP_MESSAGE_TEXT_LENGTH)
  text: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  idempotencyKey: string;
}
