import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { CleanInactiveWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { DeleteWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/delete-workspaces.command';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/start-clean-inactive-workspaces.cron.command';
import { StartCleanSuspendedWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/start-clean-suspended-workspaces.cron.commands';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/stop-clean-inactive-workspaces.cron.command';
import { StopCleanSuspendedWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/stop-clean-suspended-workspaces.cron.commands';

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
    StartCleanSuspendedWorkspacesCronCommand,
    StopCleanSuspendedWorkspacesCronCommand,
  ],
})
export class WorkspaceCleanerModule {}
