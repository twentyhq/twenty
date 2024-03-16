import { Module } from '@nestjs/common';

import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association/message-channel-message-association.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageChannelMessageAssociationRepository],
  exports: [MessageChannelMessageAssociationRepository],
})
export class MessageChannelMessageAssociationModule {}
