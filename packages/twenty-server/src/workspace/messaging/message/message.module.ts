import { Module } from '@nestjs/common';

import { MessageService } from 'src/workspace/messaging/message/message.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
