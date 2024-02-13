import { Module } from '@nestjs/common';

import { CreateCompaniesAndContactsService } from 'src/workspace/messaging/create-companies-and-contacts/create-companies-and-contacts.service';
import { CreateCompanyModule } from 'src/workspace/messaging/create-company/create-company.module';
import { CreateContactModule } from 'src/workspace/messaging/create-contact/create-contact.module';

@Module({
  imports: [CreateContactModule, CreateCompanyModule],
  providers: [CreateCompaniesAndContactsService],
  exports: [CreateCompaniesAndContactsService],
})
export class CreateCompaniesAndContactsModule {}
