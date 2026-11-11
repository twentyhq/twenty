/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PermissionSystemTableListener } from 'src/engine/permissions/system-table/listeners/permission-system-table.listener';
import { PermissionSystemTableService } from 'src/engine/permissions/system-table/services/permission-system-table.service';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [WorkspaceMigrationRunnerModule],
  providers: [PermissionSystemTableService, PermissionSystemTableListener],
  exports: [PermissionSystemTableService],
})
export class PermissionSystemTableModule {}
