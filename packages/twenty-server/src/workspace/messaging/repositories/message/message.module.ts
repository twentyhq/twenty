import { Module } from '@nestjs/common';

import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageParticipantModule } from 'src/workspace/messaging/repositories/message-participant/message-participant.module';
import { MessageThreadModule } from 'src/workspace/messaging/repositories/message-thread/message-thread.module';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    MessageThreadModule,
    MessageParticipantModule,
    MessageChannelMessageAssociationModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
