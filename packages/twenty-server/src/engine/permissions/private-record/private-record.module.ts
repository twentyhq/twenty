/* @license Enterprise */

import { Module } from '@nestjs/common';

import { AccessGroupComputationModule } from 'src/engine/permissions/internal/access-group/access-group-computation.module';
import { PrivateRecordSystemWriteService } from 'src/engine/permissions/private-record/services/private-record-system-write.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
    AccessGroupComputationModule,
  ],
  providers: [PrivateRecordSystemWriteService],
  exports: [PrivateRecordSystemWriteService],
})
export class PrivateRecordModule {}
