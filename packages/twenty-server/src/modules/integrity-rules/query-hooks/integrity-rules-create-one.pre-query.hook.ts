import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { IntegrityRuleEnforcerService } from 'src/modules/integrity-rules/services/integrity-rule-enforcer.service';

@WorkspaceQueryHook('*.createOne')
export class IntegrityRulesCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly integrityRuleEnforcerService: IntegrityRuleEnforcerService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    await this.integrityRuleEnforcerService.assertCreateIsValid({
      authContext,
      objectName,
      records: [payload.data],
      upsert: payload.upsert,
    });

    return payload;
  }
}
