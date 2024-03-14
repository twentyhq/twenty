import { Module, forwardRef } from '@nestjs/common';

import { MessageChannelModule } from 'src/workspace/messaging/repositories/message-channel/message-channel.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageParticipantModule } from 'src/workspace/messaging/repositories/message-participant/message-participant.module';
import { MessageThreadModule } from 'src/workspace/messaging/repositories/message-thread/message-thread.module';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CreateCompaniesAndContactsModule } from 'src/workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    forwardRef(() => MessageThreadModule),
    MessageParticipantModule,
    MessageChannelMessageAssociationModule,
    MessageChannelModule,
    CreateCompaniesAndContactsModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
