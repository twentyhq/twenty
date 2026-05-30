import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  buildTierFilter,
  composeFilter,
} from 'src/modules/propel-rls/build-tier-filter.util';

// Propel clean-room RLS — deal (lane ⑥). Tier logic in build-tier-filter.util.ts.
@WorkspaceQueryHook(`deal.findMany`)
export class DealRlsPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: FindManyResolverArgs,
  ): Promise<FindManyResolverArgs> {
    const tierFilter = buildTierFilter(authContext);

    return {
      ...payload,
      filter: composeFilter(payload.filter, tierFilter) as FindManyResolverArgs['filter'],
    };
  }
}
