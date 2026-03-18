import { Module } from '@nestjs/common';

import { StateTransitionValidatorModule } from 'src/engine/core-modules/state-transition/state-transition-validator.module';
import { OpportunityUpdateOnePreQueryHook } from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

@Module({
  imports: [StateTransitionValidatorModule],
  providers: [OpportunityUpdateOnePreQueryHook],
})
export class OpportunityQueryHookModule {}
