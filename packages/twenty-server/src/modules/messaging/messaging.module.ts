import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageThreadModule } from 'src/modules/messaging/repositories/message-thread/message-thread.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { MessagingPersonListener } from 'src/modules/messaging/listeners/messaging-person.listener';
import { MessageModule } from 'src/modules/messaging/repositories/message/message.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageParticipantModule } from 'src/modules/messaging/repositories/message-participant/message-participant.module';
import { MessagingWorkspaceMemberListener } from 'src/modules/messaging/listeners/messaging-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { CreateCompaniesAndContactsModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
@Module({
  imports: [
    EnvironmentModule,
    WorkspaceDataSourceModule,
    MessageModule,
    MessageThreadModule,
    MessageParticipantModule,
    CreateCompaniesAndContactsModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      MessageChannelMessageAssociationObjectMetadata,
      BlocklistObjectMetadata,
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
  ],
  providers: [
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessagingConnectedAccountListener,
  ],
  exports: [],
})
export class MessagingModule {}
