import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingGmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/messaging-gmail-client.provider';
import { MessagingGmailFetchByBatchesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-by-batch.service';
import { MessagingGmailFetchMessagesByBatchesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-by-batches.service';
import { MessagingGmailFetchMessageIdsToExcludeService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-fetch-messages-ids-to-exclude.service';
import { MessagingGmailHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/messaging-gmail-history.service';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/batch/gmail/v1',
    }),
    EnvironmentModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
      MessageChannelMessageAssociationWorkspaceEntity,
      BlocklistWorkspaceEntity,
    ]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    OAuth2ClientManagerModule,
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
  ],
  providers: [
    MessagingGmailClientProvider,
    MessagingGmailHistoryService,
    MessagingGmailFetchByBatchesService,
    MessagingGmailFetchMessagesByBatchesService,
    MessagingGmailFetchMessageIdsToExcludeService,
  ],
  exports: [
    MessagingGmailClientProvider,
    MessagingGmailHistoryService,
    MessagingGmailFetchByBatchesService,
    MessagingGmailFetchMessagesByBatchesService,
    MessagingGmailFetchMessageIdsToExcludeService,
  ],
})
export class MessagingGmailDriverModule {}
