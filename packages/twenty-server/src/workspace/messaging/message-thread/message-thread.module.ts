import { Module } from '@nestjs/common';

import { MessageThreadService } from 'src/workspace/messaging/message-thread/message-thread.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageThreadService],
  exports: [MessageThreadService],
})
export class MessageThreadModule {}
