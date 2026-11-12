/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { RecordSharingChangeService } from 'src/engine/permissions/record-share/services/record-sharing-change.service';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceQueryExecutorModule,
    RecordPermissionRepositoryModule,
    PermissionsModule,
  ],
  providers: [RecordSharingChangeService],
  exports: [RecordSharingChangeService],
})
export class RecordSharingChangeModule {}
