import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { SaveMessageAndEmitContactCreationEventService } from 'src/modules/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.service';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    MessageModule,
    ObjectMetadataRepositoryModule.forFeature([MessageChannelObjectMetadata]),
    AutoCompaniesAndContactsCreationModule,
    MessageParticipantModule,
    WorkspaceDataSourceModule,
  ],
  providers: [SaveMessageAndEmitContactCreationEventService],
  exports: [SaveMessageAndEmitContactCreationEventService],
})
export class SaveMessageAndEmitContactCreationEventModule {}
