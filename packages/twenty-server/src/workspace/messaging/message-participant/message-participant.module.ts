import { Module } from '@nestjs/common';

import { CreateCompanyModule } from 'src/workspace/messaging/create-company/create-company.module';
import { CreateContactModule } from 'src/workspace/messaging/create-contact/create-contact.module';
import { MessageParticipantService } from 'src/workspace/messaging/message-participant/message-participant.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    CreateContactModule,
    CreateCompanyModule,
  ],
  providers: [MessageParticipantService],
  exports: [MessageParticipantService],
})
export class MessageParticipantModule {}
