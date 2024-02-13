import { Module } from '@nestjs/common';

import { CreateCompanyService } from 'src/workspace/messaging/create-company/create-company.service';

@Module({
  imports: [],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
