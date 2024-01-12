import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/fetch-messages-by-batches.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';
import { GmailRefreshAccessTokenService } from 'src/workspace/messaging/services/gmail-refresh-access-token.service';
import { MessagingUtilsService } from 'src/workspace/messaging/services/messaging-utils.service';

@Module({
  imports: [
    MessagingModule,
    TypeORMModule,
    DataSourceModule,
    EnvironmentModule,
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
