import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonModule } from 'src/modules/person/repositories/person/person.module';

@Module({
  imports: [WorkspaceDataSourceModule, PersonModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
