import { BadRequestException } from '@nestjs/common';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`blocklist.createMany`)
export class BlocklistCreateManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateManyResolverArgs<BlocklistItem>,
  ): Promise<CreateManyResolverArgs<BlocklistItem>> {
    if (!authContext.user?.id) {
      throw new BadRequestException('User id is required');
    }

    await this.blocklistValidationService.validateBlocklistForCreateMany(
      payload,
      authContext.user?.id,
      authContext.workspace.id,
    );

    return payload;
  }
}
