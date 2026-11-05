import { Module } from '@nestjs/common';

import { PrivateRecordModule } from 'src/engine/permissions/private-record/private-record.module';
import { RecordShareStorageModule } from 'src/engine/permissions/internal/record-share/record-share-storage.module';
import { RecordShareOwnershipTransferService } from 'src/engine/permissions/record-share/services/record-share-ownership-transfer.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    PrivateRecordModule,
    RecordShareStorageModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  providers: [RecordShareOwnershipTransferService],
  exports: [RecordShareOwnershipTransferService],
})
export class RecordShareOwnershipTransferModule {}
