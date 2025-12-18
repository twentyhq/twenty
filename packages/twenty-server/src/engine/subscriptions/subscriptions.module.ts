import { Module } from '@nestjs/common';

import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

@Module({
  imports: [RedisClientModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
