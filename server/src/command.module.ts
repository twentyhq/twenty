import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';

import { AppModule } from './app.module';

import { WorkspaceManagerCommandsModule } from './workspace/workspace-manager/commands/workspace-manager-commands.module';
import { WorkspaceMigrationRunnerCommandsModule } from './workspace/workspace-migration-runner/commands/workspace-migration-runner-commands.module';

@Module({
  imports: [
    AppModule,
    WorkspaceMigrationRunnerCommandsModule,
    WorkspaceManagerCommandsModule,
    DatabaseCommandModule,
  ],
})
export class CommandModule {}
