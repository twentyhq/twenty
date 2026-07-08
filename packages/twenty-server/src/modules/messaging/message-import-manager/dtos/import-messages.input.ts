import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

registerEnumType(MessageDirection, {
  name: 'MessageDirection',
});

registerEnumType(MessageParticipantRole, {
  name: 'MessageParticipantRole',
});

@InputType()
export class ImportMessageParticipantInput {
  @Field(() => MessageParticipantRole)
  role: MessageParticipantRole;

  @Field(() => String)
  handle: string;

  @Field(() => String, { nullable: true })
  displayName?: string;
}

@InputType()
export class ImportMessageInput {
  @Field(() => String)
  externalId: string;

  @Field(() => String)
  messageThreadExternalId: string;

  @Field(() => String, { nullable: true })
  headerMessageId?: string;

  @Field(() => String, { nullable: true })
  subject?: string;

  @Field(() => String)
  text: string;

  @Field(() => Date)
  receivedAt: Date;

  @Field(() => MessageDirection)
  direction: MessageDirection;

  @Field(() => [ImportMessageParticipantInput])
  participants: ImportMessageParticipantInput[];
}

@InputType()
export class ImportMessagesInput {
  @Field(() => String)
  messageChannelId: string;

  @Field(() => [ImportMessageInput])
  messages: ImportMessageInput[];
}
