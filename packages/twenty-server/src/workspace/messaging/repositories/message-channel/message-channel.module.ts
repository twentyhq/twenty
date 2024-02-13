import { Module } from '@nestjs/common';

import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageChannelService],
  exports: [MessageChannelService],
})
export class MessageChannelModule {}
