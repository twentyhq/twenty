import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-by-batch.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';

import { MicrosoftGetMessageListService } from './services/microsoft-get-message-list.service';

@Module({
  imports: [
    EnvironmentModule,
    MessagingCommonModule,
    FeatureFlagModule,
    OAuth2ClientManagerModule,
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule,
  ],
  providers: [
    MicrosoftClientProvider,
    MicrosoftGetMessageListService,
    MicrosoftGetMessagesService,
    MicrosoftFetchByBatchService,
    MicrosoftHandleErrorService,
    MicrosoftOAuth2ClientManagerService,
  ],
  exports: [
    MicrosoftGetMessageListService,
    MicrosoftClientProvider,
    MicrosoftGetMessagesService,
  ],
})
export class MessagingMicrosoftDriverModule {}
