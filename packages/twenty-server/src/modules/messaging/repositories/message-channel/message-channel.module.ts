import { Module } from '@nestjs/common';

import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel/message-channel.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageChannelRepository],
  exports: [MessageChannelRepository],
})
export class MessageChannelModule {}
