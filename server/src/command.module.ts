import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';

import { AppModule } from './app.module';

import { TenantManagerCommandsModule } from './tenant-manager/commands/tenant-manager-commands.module';
import { TenantMigrationRunnerCommandsModule } from './tenant-migration-runner/commands/tenant-migration-runner-commands.module';

@Module({
  imports: [
    AppModule,
    TenantMigrationRunnerCommandsModule,
    TenantManagerCommandsModule,
    DatabaseCommandModule,
  ],
})
export class CommandModule {}
