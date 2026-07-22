import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { OpportunityCreateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-create-one.pre-query.hook';
import { OpportunityLoanToValueRatioService } from 'src/modules/opportunity/query-hooks/opportunity-loan-to-value-ratio.service';
import { OpportunityUpdateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [
    OpportunityLoanToValueRatioService,
    OpportunityCreateOnePreQueryHook,
    OpportunityUpdateOnePreQueryHook,
  ],
})
export class OpportunityModule {}
