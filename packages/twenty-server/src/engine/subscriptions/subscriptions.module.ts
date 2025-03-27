import { Module } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Module({
  exports: ['PUB_SUB'],
  providers: [
    {
      provide: 'PUB_SUB',
      inject: [RedisClientService],

      useFactory: (redisClientService: RedisClientService) =>
        new RedisPubSub({
          publisher: redisClientService.getPubSubClient(),
          subscriber: redisClientService.getPubSubClient(),
        }),
    },
  ],
})
export class SubscriptionsModule {}
