import { Module } from '@nestjs/common';

import { CreateCompanyModule } from 'src/workspace/messaging/create-company/create-company.module';
import { CreateContactService } from 'src/workspace/messaging/create-contact/create-contact.service';

@Module({
  imports: [CreateCompanyModule],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
