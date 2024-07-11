import { Module } from '@nestjs/common';

import { AutoCompaniesAndContactsCreationModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { CreateCompanyAndContactJob } from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';

@Module({
  imports: [AutoCompaniesAndContactsCreationModule],
  providers: [CreateCompanyAndContactJob],
})
export class AutoCompaniesAndContactsCreationJobModule {}
