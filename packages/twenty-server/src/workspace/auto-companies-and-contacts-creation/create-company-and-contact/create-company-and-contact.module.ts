import { Module } from '@nestjs/common';

import { PersonModule } from 'src/workspace/repositories/person/person.module';
import { WorkspaceMemberModule } from 'src/workspace/repositories/workspace-member/workspace-member.module';
import { CreateCompanyAndContactService } from 'src/workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/workspace/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/workspace/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

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
