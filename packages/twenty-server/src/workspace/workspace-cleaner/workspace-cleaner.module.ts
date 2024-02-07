import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { DeleteIncompleteWorkspacesCommand } from 'src/workspace/workspace-cleaner/commands/delete-incomplete-workspaces.command';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { CleanInactiveWorkspacesCommand } from 'src/workspace/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/workspace/workspace-cleaner/commands/start-clean-inactive-workspaces.cron.command';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/workspace/workspace-cleaner/commands/stop-clean-inactive-workspaces.cron.command';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core'), WorkspaceModule],
  providers: [
    DeleteIncompleteWorkspacesCommand,
    CleanInactiveWorkspacesCommand,
    StartCleanInactiveWorkspacesCronCommand,
    StopCleanInactiveWorkspacesCronCommand,
  ],
})
export class WorkspaceCleanerModule {}
