import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
