import { Module } from '@nestjs/common';

import { CreateContactService } from 'src/workspace/messaging/create-contact/create-contact.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
