import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CreateContactService } from 'src/workspace/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonModule } from 'src/workspace/repositories/person/person.module';

@Module({
  imports: [WorkspaceDataSourceModule, PersonModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
