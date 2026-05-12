import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelDTO } from 'src/engine/metadata-modules/message-channel/dtos/message-channel.dto';

@ObjectType('CreateEmailGroupChannelOutput')
export class CreateEmailGroupChannelOutput {
  @Field(() => MessageChannelDTO)
  messageChannel: MessageChannelDTO;

  @Field()
  forwardingAddress: string;
}
