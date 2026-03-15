import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { CompanyAccountTypeListener } from 'src/modules/company/listeners/company-account-type.listener';

@Module({
  imports: [TwentyORMModule],
  providers: [CompanyAccountTypeListener],
})
export class CompanyModule {}
