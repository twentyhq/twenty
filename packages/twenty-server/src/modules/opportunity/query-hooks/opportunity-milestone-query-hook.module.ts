import { Module } from '@nestjs/common';

import { CyclicDependencyValidatorService } from 'src/modules/opportunity/services/cyclic-dependency-validator.service';
import { OpportunityMilestoneDependencyCreateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-milestone-dependency-create-one.pre-query.hook';

@Module({
  providers: [
    CyclicDependencyValidatorService,
    OpportunityMilestoneDependencyCreateOnePreQueryHook,
  ],
})
export class OpportunityMilestoneQueryHookModule {}
