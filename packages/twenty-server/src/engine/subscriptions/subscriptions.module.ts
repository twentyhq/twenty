import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Module({
  imports: [
    RedisClientModule,
    CacheStorageModule,
    CacheLockModule,
    MetricsModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [SubscriptionService, EventStreamService],
  exports: [SubscriptionService, EventStreamService],
})
export class SubscriptionsModule {}
