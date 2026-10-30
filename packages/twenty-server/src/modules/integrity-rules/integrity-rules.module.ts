import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IntegrityRulesCreateManyPreQueryHook } from 'src/modules/integrity-rules/query-hooks/integrity-rules-create-many.pre-query.hook';
import { IntegrityRulesCreateOnePreQueryHook } from 'src/modules/integrity-rules/query-hooks/integrity-rules-create-one.pre-query.hook';
import { IntegrityRulesUpdateManyPreQueryHook } from 'src/modules/integrity-rules/query-hooks/integrity-rules-update-many.pre-query.hook';
import { IntegrityRulesUpdateOnePreQueryHook } from 'src/modules/integrity-rules/query-hooks/integrity-rules-update-one.pre-query.hook';
import { IntegrityRuleEnforcerService } from 'src/modules/integrity-rules/services/integrity-rule-enforcer.service';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [
    IntegrityRuleEnforcerService,
    IntegrityRulesCreateOnePreQueryHook,
    IntegrityRulesCreateManyPreQueryHook,
    IntegrityRulesUpdateOnePreQueryHook,
    IntegrityRulesUpdateManyPreQueryHook,
  ],
})
export class IntegrityRulesModule {}
