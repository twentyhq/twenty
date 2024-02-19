import { Module } from '@nestjs/common';

import { MessageParticipantService } from 'src/workspace/messaging/repositories/message-participant/message-participant.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { PersonModule } from 'src/workspace/messaging/repositories/person/person.module';

@Module({
  imports: [WorkspaceDataSourceModule, PersonModule],
  providers: [MessageParticipantService],
  exports: [MessageParticipantService],
})
export class MessageParticipantModule {}
