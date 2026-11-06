/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { RecordSharingChangeModule } from 'src/engine/permissions/internal/record-share/record-sharing-change.module';
import { RecordShareStorageModule } from 'src/engine/permissions/internal/record-share/record-share-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
    RecordShareStorageModule,
    RecordSharingChangeModule,
  ],
  providers: [PrivateRecordWriteService],
  exports: [PrivateRecordWriteService],
})
export class PrivateRecordModule {}
