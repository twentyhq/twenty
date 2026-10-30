import { Module } from '@nestjs/common';

import { CompanyCreateManyPreQueryHook } from 'src/modules/company-specialty/query-hooks/company-create-many.pre-query-hook';
import { CompanyCreateOnePreQueryHook } from 'src/modules/company-specialty/query-hooks/company-create-one.pre-query-hook';
import { CompanyUpdateManyPreQueryHook } from 'src/modules/company-specialty/query-hooks/company-update-many.pre-query-hook';
import { CompanyUpdateOnePreQueryHook } from 'src/modules/company-specialty/query-hooks/company-update-one.pre-query-hook';

@Module({
  providers: [
    CompanyCreateOnePreQueryHook,
    CompanyCreateManyPreQueryHook,
    CompanyUpdateOnePreQueryHook,
    CompanyUpdateManyPreQueryHook,
  ],
})
export class CompanySpecialtyQueryHookModule {}
