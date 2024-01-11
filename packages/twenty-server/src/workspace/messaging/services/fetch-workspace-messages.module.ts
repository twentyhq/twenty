import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailFullSyncService } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { GmailPartialSyncService } from 'src/workspace/messaging/services/gmail-partial-sync.service';
import { RefreshAccessTokenService } from 'src/workspace/messaging/services/refresh-access-token.service';
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
    FetchBatchMessagesService,
    RefreshAccessTokenService,
    MessagingUtilsService,
    GmailClientProvider,
  ],
  exports: [
    GmailPartialSyncService,
    GmailFullSyncService,
    RefreshAccessTokenService,
    MessagingUtilsService,
  ],
})
export class FetchWorkspaceMessagesModule {}
