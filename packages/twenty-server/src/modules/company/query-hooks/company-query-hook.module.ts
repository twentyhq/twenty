import { Module } from '@nestjs/common';

import { CompanyCreateManyPreQueryHook } from 'src/modules/company/query-hooks/company-create-many.pre-query.hook';
import { CompanyCreateOnePreQueryHook } from 'src/modules/company/query-hooks/company-create-one.pre-query.hook';
import { CompanyUpdateManyPreQueryHook } from 'src/modules/company/query-hooks/company-update-many.pre-query.hook';
import { CompanyUpdateOnePreQueryHook } from 'src/modules/company/query-hooks/company-update-one.pre-query.hook';
import { CompanyDomainUniquenessValidator } from 'src/modules/company/services/company-domain-uniqueness.validator';

@Module({
  providers: [
    CompanyDomainUniquenessValidator,
    CompanyCreateOnePreQueryHook,
    CompanyCreateManyPreQueryHook,
    CompanyUpdateOnePreQueryHook,
    CompanyUpdateManyPreQueryHook,
  ],
})
export class CompanyQueryHookModule {}
