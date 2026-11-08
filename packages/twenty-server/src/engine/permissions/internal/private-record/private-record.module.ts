/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { RecordSharingChangeModule } from 'src/engine/permissions/internal/record-share/record-sharing-change.module';
import { RecordShareStorageModule } from 'src/engine/permissions/internal/record-share/record-share-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
    RecordShareStorageModule,
    RecordSharingChangeModule,
  ],
  providers: [PrivateRecordWriteService],
  exports: [PrivateRecordWriteService],
})
export class PrivateRecordModule {}
