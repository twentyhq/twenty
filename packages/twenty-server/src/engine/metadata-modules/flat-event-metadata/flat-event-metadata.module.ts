import { Module } from '@nestjs/common';

import { WorkspaceFlatEventMetadataMapCacheService } from 'src/engine/metadata-modules/flat-event-metadata/services/workspace-flat-event-metadata-map-cache.service';

@Module({
  providers: [WorkspaceFlatEventMetadataMapCacheService],
})
export class FlatEventMetadataModule {}
