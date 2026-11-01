import { Module } from '@nestjs/common';

import { WorkspaceFlatMessagingProviderMapCacheService } from 'src/engine/metadata-modules/flat-messaging-provider/services/workspace-flat-messaging-provider-map-cache.service';

@Module({
  providers: [WorkspaceFlatMessagingProviderMapCacheService],
})
export class FlatMessagingProviderModule {}
