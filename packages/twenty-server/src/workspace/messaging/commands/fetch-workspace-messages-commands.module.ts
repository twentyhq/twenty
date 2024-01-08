import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { FetchWorkspaceMessagesCommand } from 'src/workspace/messaging/commands/fetch-workspace-messages.command';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';

@Module({
  imports: [MessagingModule, DataSourceModule, TypeORMModule],
  providers: [FetchWorkspaceMessagesCommand],
})
export class FetchWorkspaceMessagesCommandsModule {}
