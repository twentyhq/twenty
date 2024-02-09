import { Module } from '@nestjs/common';

import { ConnectedAccountModule } from 'src/workspace/messaging/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/workspace/messaging/message-channel/message-channel.module';
import { MessageThreadModule } from 'src/workspace/messaging/message-thread/message-thread.module';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { MessagingPersonListener } from 'src/workspace/messaging/listeners/messaging-person.listener';
import { MessageModule } from 'src/workspace/messaging/message/message.module';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company.service';
import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { MessageParticipantModule } from 'src/workspace/messaging/message-participant/message-participant.module';
import { MessagingWorkspaceMemberListener } from 'src/workspace/messaging/listeners/messaging-workspace-member.listener';

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
  ],
  providers: [
    GmailFullSyncService,
    GmailPartialSyncService,
    FetchMessagesByBatchesService,
    GmailRefreshAccessTokenService,
    MessagingUtilsService,
    GmailClientProvider,
    CreateCompanyService,
    MessagingPersonListener,
    MessagingWorkspaceMemberListener,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    GmailRefreshAccessTokenService,
    MessagingUtilsService,
  ],
})
export class MessagingModule {}
