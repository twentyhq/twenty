import { Module } from '@nestjs/common';

import { PersonModule } from 'src/modules/person/person.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';
import { CreateCompanyAndContactService } from 'src/modules/messaging/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/modules/messaging/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/modules/messaging/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace/datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    CreateContactModule,
    CreateCompanyModule,
    WorkspaceMemberModule,
    PersonModule,
  ],
  providers: [CreateCompanyAndContactService],
  exports: [CreateCompanyAndContactService],
})
export class CreateCompaniesAndContactsModule {}
