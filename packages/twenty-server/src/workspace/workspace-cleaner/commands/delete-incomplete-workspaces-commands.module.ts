import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { DeleteIncompleteWorkspacesCommand } from 'src/workspace/workspace-cleaner/commands/delete-incomplete-workspaces.command';
import { Workspace } from 'src/core/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core'), WorkspaceModule],
  providers: [DeleteIncompleteWorkspacesCommand],
})
export class DeleteIncompleteWorkspacesCommandsModule {}
