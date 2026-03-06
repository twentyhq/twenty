import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  type BlocklistItem,
  BlocklistValidationService,
} from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

@WorkspaceQueryHook(`blocklist.createMany`)
export class BlocklistCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly blocklistValidationService: BlocklistValidationService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<BlocklistItem>,
  ): Promise<CreateManyResolverArgs<BlocklistItem>> {
    if (!isUserAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'User id is required',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
        { userFriendlyMessage: msg`User id is required.` },
      );
    }

    await this.blocklistValidationService.validateBlocklistForCreateMany(
      payload,
      authContext.user.id,
      authContext.workspace.id,
    );

    return payload;
  }
}
