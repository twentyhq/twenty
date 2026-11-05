import { Module } from '@nestjs/common';

import { RecordPermissionOrmModule } from 'src/engine/permissions/record-permission-orm/record-permission-orm.module';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, RecordPermissionOrmModule],
  providers: [RecordShareStorageService, PrivateRecordStorageService],
  exports: [RecordShareStorageService, PrivateRecordStorageService],
})
export class RecordShareStorageModule {}
