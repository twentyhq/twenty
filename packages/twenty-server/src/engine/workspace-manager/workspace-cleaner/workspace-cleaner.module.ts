import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { CleanInactiveWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { CleanSuspendedWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-suspended-workspaces.cron.command';
import { DeleteWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/delete-workspaces.command';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/start-clean-inactive-workspaces.cron.command';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/stop-clean-inactive-workspaces.cron.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceModule,
    DataSourceModule,
  ],
  providers: [
    DeleteWorkspacesCommand,
    CleanInactiveWorkspacesCommand,
    StartCleanInactiveWorkspacesCronCommand,
    StopCleanInactiveWorkspacesCronCommand,
    CleanSuspendedWorkspacesCronCommand,
  ],
})
export class WorkspaceCleanerModule {}
