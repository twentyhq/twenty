import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { ConnectedAccountModule } from 'src/workspace/messaging/connected-account/connected-account.module';
import { MessageChannelMessageAssociationModule } from 'src/workspace/messaging/message-channel-message-association/message-channel-message-assocation.module';
import { MessageChannelModule } from 'src/workspace/messaging/message-channel/message-channel.module';
import { MessageModule } from 'src/workspace/messaging/message/message.module';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    EnvironmentModule,
    WorkspaceDataSourceModule,
    ConnectedAccountModule,
    MessageChannelModule,
    MessageChannelMessageAssociationModule,
    MessageModule,
  ],
  providers: [
    GmailFullSyncService,
    GmailPartialSyncService,
    FetchMessagesByBatchesService,
    GmailRefreshAccessTokenService,
    MessagingUtilsService,
    GmailClientProvider,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    GmailRefreshAccessTokenService,
    MessagingUtilsService,
  ],
})
export class FetchWorkspaceMessagesModule {}
