import { Module } from '@nestjs/common';

import { ContactCreationManagerModule } from 'src/modules/contact-creation-manager/contact-creation-manager.module';
import { CreateCompanyAndContactJob } from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';

@Module({
  imports: [ContactCreationManagerModule],
  providers: [CreateCompanyAndContactJob],
})
export class AutoCompaniesAndContactsCreationJobModule {}
