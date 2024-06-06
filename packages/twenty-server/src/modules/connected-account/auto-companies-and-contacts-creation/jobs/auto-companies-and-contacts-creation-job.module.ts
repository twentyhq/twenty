import { Module } from '@nestjs/common';

import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { CreateCompanyAndContactJob } from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';

@Module({
  imports: [AutoCompaniesAndContactsCreationModule],
  providers: [
    {
      provide: CreateCompanyAndContactJob.name,
      useClass: CreateCompanyAndContactJob,
    },
  ],
})
export class AutoCompaniesAndContactsCreationJobModule {}
