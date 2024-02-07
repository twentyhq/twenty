import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { DeleteIncompleteWorkspacesCommand } from 'src/workspace/workspace-cleaner/commands/delete-incomplete-workspaces.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

@Module({
  imports: [TypeORMModule, WorkspaceModule],
  providers: [DeleteIncompleteWorkspacesCommand],
})
export class DeleteIncompleteWorkspacesCommandsModule {}
