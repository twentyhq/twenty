import { Module } from '@nestjs/common';

import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';

@Module({
  imports: [],
  providers: [MessagingProducer],
  exports: [MessagingProducer],
})
export class MessagingModule {}
