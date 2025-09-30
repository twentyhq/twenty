import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceTrashCleanupCronCommand } from 'src/engine/workspace-manager/workspace-trash-cleanup/commands/workspace-trash-cleanup.cron.command';
import { WorkspaceTrashCleanupCronJob } from 'src/engine/workspace-manager/workspace-trash-cleanup/crons/workspace-trash-cleanup.cron.job';
import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';
import { WorkspaceTrashTableDiscoveryService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-table-discovery.service';
import { WorkspaceTrashDeletionService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-deletion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [
    WorkspaceTrashTableDiscoveryService,
    WorkspaceTrashDeletionService,
    WorkspaceTrashCleanupService,
    WorkspaceTrashCleanupCronJob,
    WorkspaceTrashCleanupCronCommand,
  ],
  exports: [WorkspaceTrashCleanupCronCommand],
})
export class WorkspaceTrashCleanupModule {}
