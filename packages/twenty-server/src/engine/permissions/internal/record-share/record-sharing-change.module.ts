/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { RecordSharingChangeService } from 'src/engine/permissions/internal/record-share/services/record-sharing-change.service';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceQueryExecutorModule,
    RecordPermissionOrmModule,
    PermissionsModule,
  ],
  providers: [RecordSharingChangeService],
  exports: [RecordSharingChangeService],
})
export class RecordSharingChangeModule {}
