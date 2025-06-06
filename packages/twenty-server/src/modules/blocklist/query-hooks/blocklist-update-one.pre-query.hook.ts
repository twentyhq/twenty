import { BadRequestException } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@WorkspaceQueryHook(`blocklist.updateOne`)
export class BlocklistUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: UpdateOneResolverArgs<BlocklistItem>,
  ): Promise<UpdateOneResolverArgs<BlocklistItem>> {
    if (!authContext.user?.id) {
      throw new BadRequestException('User id is required');
    }

    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    await this.blocklistValidationService.validateBlocklistForUpdateOne(
      payload,
      authContext.user?.id,
      workspace.id,
    );

    return payload;
  }
}
