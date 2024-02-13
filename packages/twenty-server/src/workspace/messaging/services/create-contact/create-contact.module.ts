import { Module } from '@nestjs/common';

import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';

@Module({
  imports: [],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
