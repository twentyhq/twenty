import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { type BlocklistItem } from 'src/modules/blocklist/types/blocklist-item.type';
import { buildBlocklistMutationContextOrThrow } from 'src/modules/blocklist/utils/build-blocklist-mutation-context-or-throw.util';

@WorkspaceQueryHook(`blocklist.createOne`)
export class BlocklistCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<Partial<BlocklistItem>>,
  ): Promise<CreateOneResolverArgs<Partial<BlocklistItem>>> {
    await this.blocklistValidationService.validateBlocklistForCreateMany({
      payload: { data: [payload.data] },
      context: buildBlocklistMutationContextOrThrow(authContext),
    });

    return payload;
  }
}
