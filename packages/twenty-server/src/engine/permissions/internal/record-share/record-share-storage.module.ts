import { Module } from '@nestjs/common';

import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, RecordPermissionRepositoryModule],
  providers: [RecordShareStorageService],
  exports: [RecordShareStorageService],
})
export class RecordShareStorageModule {}
