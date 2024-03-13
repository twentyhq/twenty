import { Module, forwardRef } from '@nestjs/common';

import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageThreadService } from 'src/workspace/messaging/repositories/message-thread/message-thread.service';
import { MessageModule } from 'src/workspace/messaging/repositories/message/message.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    MessageChannelMessageAssociationModule,
    forwardRef(() => MessageModule),
  ],
  providers: [MessageThreadService],
  exports: [MessageThreadService],
})
export class MessageThreadModule {}
