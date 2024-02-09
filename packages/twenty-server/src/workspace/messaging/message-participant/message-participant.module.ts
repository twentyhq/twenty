import { Module } from '@nestjs/common';

import { MessageParticipantService } from 'src/workspace/messaging/message-participant/message-participant.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageParticipantService],
  exports: [MessageParticipantService],
})
export class MessageParticipantModule {}
