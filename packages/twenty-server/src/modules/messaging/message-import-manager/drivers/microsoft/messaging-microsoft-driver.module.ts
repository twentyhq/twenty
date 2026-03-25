import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MicrosoftMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-message-list-fetch-error-handler.service';
import { MicrosoftMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-messages-import-error-handler.service';
import { MicrosoftNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-network-error-handler.service';

import { MicrosoftGetMessageListService } from './services/microsoft-get-message-list.service';

@Module({
  imports: [
    TwentyConfigModule,
    MessagingCommonModule,
    FeatureFlagModule,
    OAuth2ClientManagerModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule,
  ],
  providers: [
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftFetchByBatchService,
    MicrosoftNetworkErrorHandler,
    MicrosoftMessageListFetchErrorHandler,
    MicrosoftMessagesImportErrorHandler,
  ],
  exports: [
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftMessageListFetchErrorHandler,
    MicrosoftMessagesImportErrorHandler,
  ],
})
export class MessagingMicrosoftDriverModule {}
