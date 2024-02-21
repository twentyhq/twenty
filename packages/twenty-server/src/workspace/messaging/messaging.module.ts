import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountModule } from 'src/workspace/messaging/repositories/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/workspace/messaging/repositories/message-channel/message-channel.module';
import { MessageThreadModule } from 'src/workspace/messaging/repositories/message-thread/message-thread.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { MessagingPersonListener } from 'src/workspace/messaging/listeners/messaging-person.listener';
import { MessageModule } from 'src/workspace/messaging/repositories/message/message.module';
import { GmailClientProvider } from 'src/workspace/messaging/services/providers/gmail/gmail-client.provider';
import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';
import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { MessageParticipantModule } from 'src/workspace/messaging/repositories/message-participant/message-participant.module';
import { MessagingWorkspaceMemberListener } from 'src/workspace/messaging/listeners/messaging-workspace-member.listener';
import { IsContactAutoCreationEnabledListener } from 'src/workspace/messaging/listeners/is-contact-auto-creation-enabled-listener';
import { MessagingMessageChannelListener } from 'src/workspace/messaging/listeners/messaging-message-channel.listener';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { WorkspaceMemberModule } from 'src/workspace/messaging/repositories/workspace-member/workspace-member.module';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { CreateCompaniesAndContactsModule } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.module';
import { CompanyModule } from 'src/workspace/messaging/repositories/company/company.module';
import { PersonModule } from 'src/workspace/messaging/repositories/person/person.module';
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
  ],
  providers: [
    GmailFullSyncService,
    GmailPartialSyncService,
    FetchMessagesByBatchesService,
    GmailRefreshAccessTokenService,
    GmailClientProvider,
    CreateContactService,
    CreateCompanyService,
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
    IsContactAutoCreationEnabledListener,
    MessagingMessageChannelListener,
    MessageService,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    GmailRefreshAccessTokenService,
  ],
})
export class MessagingModule {}
