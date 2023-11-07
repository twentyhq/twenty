import { Module } from '@nestjs/common';

import { DatabaseCommandModule } from 'src/database/commands/database-command.module';

import { AppModule } from './app.module';

import { MetadataCommandModule } from './metadata/commands/metadata-command.module';

@Module({
  imports: [AppModule, MetadataCommandModule, DatabaseCommandModule],
})
export class CommandModule {}
