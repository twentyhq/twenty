import { Module } from '@nestjs/common';

import { RecordPermissionOrmModule } from 'src/engine/permissions/record-permission-orm/record-permission-orm.module';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, RecordPermissionOrmModule],
  providers: [RecordShareStorageService],
  exports: [RecordShareStorageService],
})
export class RecordShareStorageModule {}
