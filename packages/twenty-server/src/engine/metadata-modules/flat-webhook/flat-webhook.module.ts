import { Module } from '@nestjs/common';

import { WorkspaceFlatWebhookMapCacheService } from 'src/engine/metadata-modules/flat-webhook/services/workspace-flat-webhook-map-cache.service';

@Module({
  providers: [WorkspaceFlatWebhookMapCacheService],
  exports: [WorkspaceFlatWebhookMapCacheService],
})
export class FlatWebhookModule {}
