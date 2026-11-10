/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, RecordPermissionRepositoryModule],
  providers: [PrivateRecordWriteService],
  exports: [PrivateRecordWriteService],
})
export class PrivateRecordModule {}
