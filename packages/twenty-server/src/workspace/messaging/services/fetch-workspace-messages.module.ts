import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { FetchWorkspaceMessagesService } from 'src/workspace/messaging/services/fetch-workspace-messages.service';
import { RefreshAccessTokenService } from 'src/workspace/messaging/services/refresh-access-token.service';

@Module({
  imports: [TypeORMModule, DataSourceModule, EnvironmentModule],
  providers: [
    FetchWorkspaceMessagesService,
    FetchBatchMessagesService,
    RefreshAccessTokenService,
  ],
  exports: [FetchWorkspaceMessagesService],
})
export class FetchWorkspaceMessagesModule {}
