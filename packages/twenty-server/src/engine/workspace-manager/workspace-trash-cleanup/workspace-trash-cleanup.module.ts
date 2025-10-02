import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceTrashCleanupCronCommand } from 'src/engine/workspace-manager/workspace-trash-cleanup/commands/workspace-trash-cleanup.cron.command';
import { WorkspaceTrashCleanupCronJob } from 'src/engine/workspace-manager/workspace-trash-cleanup/crons/workspace-trash-cleanup.cron.job';
import { WorkspaceTrashCleanupJob } from 'src/engine/workspace-manager/workspace-trash-cleanup/jobs/workspace-trash-cleanup.job';
import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, ObjectMetadataEntity])],
  providers: [
    WorkspaceTrashCleanupService,
    WorkspaceTrashCleanupJob,
    WorkspaceTrashCleanupCronJob,
    WorkspaceTrashCleanupCronCommand,
  ],
  exports: [WorkspaceTrashCleanupCronCommand],
})
export class WorkspaceTrashCleanupModule {}
