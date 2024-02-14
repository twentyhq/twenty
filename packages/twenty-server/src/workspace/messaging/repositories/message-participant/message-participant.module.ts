import { Module } from '@nestjs/common';

import { CreateCompaniesAndContactsModule } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.module';
import { MessageParticipantService } from 'src/workspace/messaging/repositories/message-participant/message-participant.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule, CreateCompaniesAndContactsModule],
  providers: [MessageParticipantService],
  exports: [MessageParticipantService],
})
export class MessageParticipantModule {}
