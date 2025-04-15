import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GmailFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-fetch-by-batch.service';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { GmailHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-handle-error.service';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';
import { OAuth2ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/oauth2-client.provider';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
    TwentyConfigModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlag], 'core'),
    OAuth2ClientManagerModule,
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
  ],
  providers: [
    GmailClientProvider,
    OAuth2ClientProvider,
    GmailGetHistoryService,
    GmailFetchByBatchService,
    GmailGetMessagesService,
    GmailGetMessageListService,
    GmailHandleErrorService,
  ],
  exports: [
    GmailGetMessagesService,
    GmailGetMessageListService,
    GmailClientProvider,
    OAuth2ClientProvider,
  ],
})
export class MessagingGmailDriverModule {}
