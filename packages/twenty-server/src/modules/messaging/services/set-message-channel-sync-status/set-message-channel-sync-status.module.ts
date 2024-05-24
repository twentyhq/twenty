import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { SetMessageChannelSyncStatusService } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([MessageChannelWorkspaceEntity]),
  ],
  providers: [SetMessageChannelSyncStatusService],
  exports: [SetMessageChannelSyncStatusService],
})
export class SetMessageChannelSyncStatusModule {}
