import { Module } from '@nestjs/common';

import { AgentProfileModule } from 'src/modules/agent-profile/agent-profile.module';
import { PolicyCreateManyPostQueryHook } from 'src/modules/policy/query-hooks/policy-create-many.post-query.hook';
import { PolicyCreateManyPreQueryHook } from 'src/modules/policy/query-hooks/policy-create-many.pre-query.hook';
import { PolicyCreateOnePostQueryHook } from 'src/modules/policy/query-hooks/policy-create-one.post-query.hook';
import { PolicyCreateOnePreQueryHook } from 'src/modules/policy/query-hooks/policy-create-one.pre-query.hook';
import { PolicyUpdateManyPostQueryHook } from 'src/modules/policy/query-hooks/policy-update-many.post-query.hook';
import { PolicyUpdateManyPreQueryHook } from 'src/modules/policy/query-hooks/policy-update-many.pre-query.hook';
import { PolicyUpdateOnePostQueryHook } from 'src/modules/policy/query-hooks/policy-update-one.post-query.hook';
import { PolicyUpdateOnePreQueryHook } from 'src/modules/policy/query-hooks/policy-update-one.pre-query.hook';

@Module({
  imports: [AgentProfileModule],
  providers: [
    PolicyCreateOnePreQueryHook,
    PolicyCreateManyPreQueryHook,
    PolicyUpdateOnePreQueryHook,
    PolicyUpdateManyPreQueryHook,
    PolicyCreateOnePostQueryHook,
    PolicyCreateManyPostQueryHook,
    PolicyUpdateOnePostQueryHook,
    PolicyUpdateManyPostQueryHook,
  ],
})
export class PolicyQueryHookModule {}
