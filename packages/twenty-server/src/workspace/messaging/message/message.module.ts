import { Module } from '@nestjs/common';

import { CreateCompaniesAndContactsModule } from 'src/workspace/messaging/create-companies-and-contacts/create-companies-and-contacts.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/workspace/messaging/message-channel/message-channel.module';
import { MessageParticipantModule } from 'src/workspace/messaging/message-participant/message-participant.module';
import { MessageThreadModule } from 'src/workspace/messaging/message-thread/message-thread.module';
import { MessageService } from 'src/workspace/messaging/message/message.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    MessageThreadModule,
    MessageParticipantModule,
    MessageChannelMessageAssociationModule,
    MessageChannelModule,
    CreateCompaniesAndContactsModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
