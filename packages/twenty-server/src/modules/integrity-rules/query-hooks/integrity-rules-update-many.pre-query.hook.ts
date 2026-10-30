import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { IntegrityRuleEnforcerService } from 'src/modules/integrity-rules/services/integrity-rule-enforcer.service';

@WorkspaceQueryHook('*.updateMany')
export class IntegrityRulesUpdateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly integrityRuleEnforcerService: IntegrityRuleEnforcerService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    objectName: string,
    payload: UpdateManyResolverArgs,
  ): Promise<UpdateManyResolverArgs> {
    await this.integrityRuleEnforcerService.assertUpdateIsValid({
      authContext,
      objectName,
      filter: payload.filter,
      data: payload.data,
    });

    return payload;
  }
}
