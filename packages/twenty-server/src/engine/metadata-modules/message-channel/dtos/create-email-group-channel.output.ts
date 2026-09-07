import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';

@ObjectType('CreateEmailGroupChannelOutput')
export class CreateEmailGroupChannelOutput {
  @Field(() => MessageChannelDTO)
  messageChannel: MessageChannelDTO;

  @Field()
  forwardingAddress: string;

  // Set when an email forwarding provider is connected but could not provision the
  // address, so the channel still exists and the manual instructions stay usable.
  @Field(() => String, { nullable: true })
  forwardingFailureReason: string | null;
}
