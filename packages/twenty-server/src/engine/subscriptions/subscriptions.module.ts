import { Module } from '@nestjs/common';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Module({
  imports: [
    RedisClientModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    CacheStorageModule,
  ],
  providers: [SubscriptionService, EventStreamService],
  exports: [SubscriptionService, EventStreamService],
})
export class SubscriptionsModule {}
