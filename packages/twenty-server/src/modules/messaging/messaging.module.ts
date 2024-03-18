import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { MessageThreadModule } from 'src/modules/messaging/repositories/message-thread/message-thread.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { MessagingPersonListener } from 'src/modules/messaging/listeners/messaging-person.listener';
import { MessageModule } from 'src/modules/messaging/repositories/message/message.module';
import { GmailClientProvider } from 'src/modules/messaging/services/providers/gmail/gmail-client.provider';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { CreateCompanyService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.service';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/modules/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/modules/messaging/services/gmail-partial-sync.service';
import { GoogleAPIsRefreshAccessTokenService } from 'src/modules/connected-account/services/google-apis-refresh-access-token.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageParticipantModule } from 'src/modules/messaging/repositories/message-participant/message-participant.module';
import { MessagingWorkspaceMemberListener } from 'src/modules/messaging/listeners/messaging-workspace-member.listener';
import { MessagingMessageChannelListener } from 'src/modules/messaging/listeners/messaging-message-channel.listener';
import { MessageRepository } from 'src/modules/messaging/repositories/message/message.repository';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { CreateCompaniesAndContactsModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { CompanyModule } from 'src/modules/company/repositories/company/company.module';
import { SaveMessagesAndCreateContactsService } from 'src/modules/messaging/services/save-messages-and-create-contacts.service';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { BlocklistModule } from 'src/modules/connected-account/repositories/blocklist/blocklist.module';
import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch.service';
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
    CompanyModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      MessageChannelMessageAssociationObjectMetadata,
      BlocklistObjectMetadata,
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
    BlocklistModule,
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
  ],
  providers: [
    GmailFullSyncService,
    GmailPartialSyncService,
    FetchMessagesByBatchesService,
    GoogleAPIsRefreshAccessTokenService,
    GmailClientProvider,
    CreateContactService,
    CreateCompanyService,
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    MessagingMessageChannelListener,
    MessageRepository,
    SaveMessagesAndCreateContactsService,
    MessagingConnectedAccountListener,
    FetchByBatchesService,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    GoogleAPIsRefreshAccessTokenService,
    FetchByBatchesService,
  ],
})
export class MessagingModule {}
