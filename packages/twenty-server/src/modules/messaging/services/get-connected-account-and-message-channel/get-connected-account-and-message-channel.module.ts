import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GetConnectedAccountAndMessageChannelService } from 'src/modules/messaging/services/get-connected-account-and-message-channel/get-connected-account-and-message-channel.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
    ]),
  ],
  providers: [GetConnectedAccountAndMessageChannelService],
  exports: [GetConnectedAccountAndMessageChannelService],
})
export class GetConnectedAccountAndMessageChannelModule {}
