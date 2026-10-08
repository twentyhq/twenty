import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type RestoreOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { buildBlocklistMutationContextOrThrow } from 'src/modules/blocklist/utils/build-blocklist-mutation-context-or-throw.util';

@WorkspaceQueryHook(`blocklist.restoreOne`)
export class BlocklistRestoreOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: RestoreOneResolverArgs,
  ): Promise<RestoreOneResolverArgs> {
    await this.blocklistValidationService.validateBlocklistForRestoreOne({
      id: payload.id,
      context: buildBlocklistMutationContextOrThrow(authContext),
    });

    return payload;
  }
}
