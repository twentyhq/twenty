import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/services/message-channel-sync-status/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([MessageChannelWorkspaceEntity]),
  ],
  providers: [MessageChannelSyncStatusService],
  exports: [MessageChannelSyncStatusService],
})
export class SetMessageChannelSyncStatusModule {}
