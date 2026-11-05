/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PrivateRecordWriteService } from 'src/engine/permissions/private-record/services/private-record-write.service';
import { RecordPermissionOrmModule } from 'src/engine/permissions/record-permission-orm/record-permission-orm.module';
import { RecordShareStorageModule } from 'src/engine/permissions/record-share/record-share-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
    RecordShareStorageModule,
  ],
  providers: [PrivateRecordWriteService],
  exports: [PrivateRecordWriteService],
})
export class PrivateRecordModule {}
