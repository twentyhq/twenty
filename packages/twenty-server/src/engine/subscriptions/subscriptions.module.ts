import { Module } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

@Module({
  exports: ['PUB_SUB'],
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        return new PubSub();
      },
    },
  ],
})
export class SubscriptionsModule {}
