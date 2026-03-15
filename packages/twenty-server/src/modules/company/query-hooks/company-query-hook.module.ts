import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { CompanyUpdateOnePreQueryHook } from 'src/modules/company/query-hooks/company-update-one.pre-query.hook';

@Module({
  imports: [TwentyORMModule],
  providers: [CompanyUpdateOnePreQueryHook],
})
export class CompanyQueryHookModule {}
