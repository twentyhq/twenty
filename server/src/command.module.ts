import { Module } from '@nestjs/common';

import { AppModule } from './app.module';

import { MetadataCommandModule } from './metadata/commands/metadata-command.module';

@Module({
  imports: [AppModule, MetadataCommandModule],
})
export class CommandModule {}
