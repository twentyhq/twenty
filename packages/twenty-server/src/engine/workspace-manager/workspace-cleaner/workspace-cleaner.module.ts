import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceModule } from 'src/engine/modules/workspace/workspace.module';
import { DeleteIncompleteWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/delete-incomplete-workspaces.command';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { CleanInactiveWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/start-clean-inactive-workspaces.cron.command';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/stop-clean-inactive-workspaces.cron.command';
import { DataSourceModule } from 'src/engine-metadata/data-source/data-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceModule,
    DataSourceModule,
  ],
  providers: [
    DeleteIncompleteWorkspacesCommand,
    CleanInactiveWorkspacesCommand,
    StartCleanInactiveWorkspacesCronCommand,
    StopCleanInactiveWorkspacesCronCommand,
  ],
})
export class WorkspaceCleanerModule {}
