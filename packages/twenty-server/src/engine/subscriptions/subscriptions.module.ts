import { Module } from '@nestjs/common';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Module({
  imports: [RedisClientModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
