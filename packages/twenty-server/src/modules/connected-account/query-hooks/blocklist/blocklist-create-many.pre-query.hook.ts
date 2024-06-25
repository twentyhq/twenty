import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/connected-account/services/blocklist/blocklist-validation.service';

@WorkspaceQueryHook(`blocklist.createMany`)
export class BlocklistCreateManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: CreateManyResolverArgs<BlocklistItem>,
  ): Promise<void> {
    await this.blocklistValidationService.validateBlocklistForCreateMany(
      payload,
      userId,
      workspaceId,
    );
  }
}
