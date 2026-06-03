import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { composeFilter } from 'src/modules/propel-rls/build-tier-filter.util';
import { PropelTierService } from 'src/modules/propel-rls/propel-tier.service';

// Propel clean-room RLS — rcbiOpportunity.groupBy. Tier resolved from Twenty role in propel-tier.service.ts.
@WorkspaceQueryHook(`rcbiOpportunity.groupBy`)
export class RcbiOpportunityGroupByRlsPreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(private readonly propelTierService: PropelTierService) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: GroupByResolverArgs,
  ): Promise<GroupByResolverArgs> {
    const tierFilter = await this.propelTierService.buildTierFilter(authContext);

    return {
      ...payload,
      filter: composeFilter(payload.filter, tierFilter) as GroupByResolverArgs['filter'],
    };
  }
}
