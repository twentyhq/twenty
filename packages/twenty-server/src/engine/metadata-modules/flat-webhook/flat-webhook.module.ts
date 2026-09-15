import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatWebhookMapCacheService } from 'src/engine/metadata-modules/flat-webhook/services/workspace-flat-webhook-map-cache.service';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, WebhookEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceFlatWebhookMapCacheService,
    provideWorkspaceScopedRepository(WebhookEntity),
  ],
  exports: [WorkspaceFlatWebhookMapCacheService],
})
export class FlatWebhookModule {}
