import { Module } from '@nestjs/common';

import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';

@Module({
  imports: [],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
