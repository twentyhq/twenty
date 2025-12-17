import { Module } from '@nestjs/common';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Module({
  imports: [RedisClientModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
