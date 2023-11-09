import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';

import { AppModule } from './app.module';

import { MetadataCommandsModule } from './metadata/commands/metadata-commands.module';
import { TenantMigrationRunnerCommandsModule } from './tenant-migration-runner/commands/tenant-migration-runner-commands.module';

@Module({
  imports: [
    AppModule,
    MetadataCommandsModule,
    TenantMigrationRunnerCommandsModule,
    DatabaseCommandModule,
  ],
})
export class CommandModule {}
