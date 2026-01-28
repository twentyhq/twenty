import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatWebhookMapCacheService } from 'src/engine/metadata-modules/flat-webhook/services/workspace-flat-webhook-map-cache.service';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatWebhookMapCacheService],
  exports: [WorkspaceFlatWebhookMapCacheService],
})
export class FlatWebhookModule {}
