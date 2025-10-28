import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';

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
    MicrosoftHandleErrorService,
  ],
  exports: [
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftHandleErrorService,
  ],
})
export class MessagingMicrosoftDriverModule {}
