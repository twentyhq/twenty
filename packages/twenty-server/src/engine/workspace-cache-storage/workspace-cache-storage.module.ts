import { Module } from '@nestjs/common';

import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, WorkspaceCacheVersionModule],
  providers: [WorkspaceCacheStorageService],
  exports: [WorkspaceCacheStorageService],
})
export class WorkspaceCacheStorageModule {}
