import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { RefreshMessageChannelRecordSharesJob } from 'src/modules/messaging/common/jobs/refresh-message-channel-record-shares.job';
import { MessageChannelRecordShareService } from 'src/modules/messaging/common/services/message-channel-record-share.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      MessageFolderEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
    ConnectedAccountModule,
    MetricsModule,
    RecordShareModule,
  ],
  providers: [
    MessageChannelSyncStatusService,
    MessageChannelRecordShareService,
    RefreshMessageChannelRecordSharesJob,
  ],
  exports: [MessageChannelSyncStatusService, MessageChannelRecordShareService],
})
export class MessagingCommonModule {}
