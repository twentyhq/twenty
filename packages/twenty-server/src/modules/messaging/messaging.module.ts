import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ConnectedAccountModule } from 'src/modules/connected-account/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/modules/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/modules/messaging/repositories/message-channel/message-channel.module';
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
import { MessageService } from 'src/modules/messaging/repositories/message/message.service';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/repositories/workspace-member/workspace-member.module';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { CreateCompaniesAndContactsModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { CompanyModule } from 'src/modules/messaging/repositories/company/company.module';
import { PersonModule } from 'src/modules/person/repositories/person/person.module';
import { SaveMessagesAndCreateContactsService } from 'src/modules/messaging/services/save-messages-and-create-contacts.service';
import { MessagingConnectedAccountListener } from 'src/modules/messaging/listeners/messaging-connected-account.listener';
import { BlocklistModule } from 'src/modules/connected-account/repositories/blocklist/blocklist.module';
import { FetchByBatchesService } from 'src/modules/messaging/services/fetch-by-batch.service';
@Module({
  imports: [
    EnvironmentModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    MessageChannelModule,
    MessageChannelMessageAssociationModule,
    MessageModule,
    MessageThreadModule,
    MessageParticipantModule,
    CreateCompaniesAndContactsModule,
    WorkspaceMemberModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    CompanyModule,
    PersonModule,
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
    MessageService,
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
