import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { MessagingProvidersModule } from 'src/workspace/messaging/providers/messaging-providers.module';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailFullSync } from 'src/workspace/messaging/services/gmail-full-sync.service';
import { RefreshAccessTokenService } from 'src/workspace/messaging/services/refresh-access-token.service';

@Module({
  imports: [
    MessagingModule,
    TypeORMModule,
    DataSourceModule,
    EnvironmentModule,
    MessagingProvidersModule,
  ],
  providers: [
    GmailFullSync,
    FetchBatchMessagesService,
    RefreshAccessTokenService,
  ],
  exports: [GmailFullSync, RefreshAccessTokenService],
})
export class FetchWorkspaceMessagesModule {}
