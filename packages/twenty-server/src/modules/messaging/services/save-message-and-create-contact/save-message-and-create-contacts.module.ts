import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateCompaniesAndContactsModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { SaveMessagesAndCreateContactsService } from 'src/modules/messaging/services/save-message-and-create-contact/save-messages-and-create-contacts.service';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';

@Module({
  imports: [
    MessageModule,
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelObjectMetadata,
      MessageParticipantObjectMetadata,
    ]),
    CreateCompaniesAndContactsModule,
    MessageParticipantModule,
    WorkspaceDataSourceModule,
  ],
  providers: [SaveMessagesAndCreateContactsService],
  exports: [SaveMessagesAndCreateContactsService],
})
export class SaveMessagesAndCreateContactsModule {}
