import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { MessagingProvidersModule } from 'src/workspace/messaging/providers/messaging-providers.module';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { FetchWorkspaceMessagesService } from 'src/workspace/messaging/services/fetch-workspace-messages.service';
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
    FetchWorkspaceMessagesService,
    FetchBatchMessagesService,
    RefreshAccessTokenService,
  ],
  exports: [FetchWorkspaceMessagesService, RefreshAccessTokenService],
})
export class FetchWorkspaceMessagesModule {}
