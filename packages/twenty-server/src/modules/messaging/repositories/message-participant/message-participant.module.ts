import { Module } from '@nestjs/common';

import { MessageParticipantService } from 'src/modules/messaging/repositories/message-participant/message-participant.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { PersonModule } from 'src/modules/person/repositories/person/person.module';

@Module({
  imports: [WorkspaceDataSourceModule, PersonModule],
  providers: [MessageParticipantService],
  exports: [MessageParticipantService],
})
export class MessageParticipantModule {}
