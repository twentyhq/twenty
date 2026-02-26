import { Module } from '@nestjs/common';

import { AgentProfileModule } from 'src/modules/agent-profile/agent-profile.module';
import { PolicyCreateManyPreQueryHook } from 'src/modules/policy/query-hooks/policy-create-many.pre-query.hook';
import { PolicyCreateOnePreQueryHook } from 'src/modules/policy/query-hooks/policy-create-one.pre-query.hook';

@Module({
  imports: [AgentProfileModule],
  providers: [PolicyCreateOnePreQueryHook, PolicyCreateManyPreQueryHook],
})
export class PolicyQueryHookModule {}
