import { Module } from '@nestjs/common';

import { AgentProfileModule } from 'src/modules/agent-profile/agent-profile.module';
import { LeadCreateManyPreQueryHook } from 'src/modules/lead/query-hooks/lead-create-many.pre-query.hook';
import { LeadCreateOnePreQueryHook } from 'src/modules/lead/query-hooks/lead-create-one.pre-query.hook';
import { PersonCreateManyPreQueryHook } from 'src/modules/lead/query-hooks/person-create-many.pre-query.hook';
import { PersonCreateOnePreQueryHook } from 'src/modules/lead/query-hooks/person-create-one.pre-query.hook';

@Module({
  imports: [AgentProfileModule],
  providers: [
    LeadCreateOnePreQueryHook,
    LeadCreateManyPreQueryHook,
    PersonCreateOnePreQueryHook,
    PersonCreateManyPreQueryHook,
  ],
})
export class LeadQueryHookModule {}
