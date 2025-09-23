import { BadRequestException } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  type BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';

@WorkspaceQueryHook(`blocklist.createMany`)
export class BlocklistCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<BlocklistItem>,
  ): Promise<CreateManyResolverArgs<BlocklistItem>> {
    if (!authContext.user?.id) {
      throw new BadRequestException('User id is required');
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.blocklistValidationService.validateBlocklistForCreateMany(
      payload,
      authContext.user?.id,
      workspace.id,
    );

    return payload;
  }
}
