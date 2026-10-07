import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceSignalModule } from 'src/engine/core-modules/workspace-signal/workspace-signal.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      MessageFolderEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
    ConnectedAccountModule,
    MetricsModule,
    WorkspaceSignalModule,
  ],
  providers: [
    MessageChannelSyncStatusService,
    provideWorkspaceScopedRepository(MessageFolderEntity),
  ],
  exports: [MessageChannelSyncStatusService],
})
export class MessagingCommonModule {}
