import { Module } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

import { EventsListener } from 'src/engine/subscriptions/events.listener';
import { SubscriptionsResolver } from 'src/engine/subscriptions/subscriptions.resolver';

@Module({
  imports: [],
  exports: [],
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        return new PubSub();
      },
    },
    SubscriptionsResolver,
    EventsListener,
  ],
})
export class SubscriptionsModule {}
