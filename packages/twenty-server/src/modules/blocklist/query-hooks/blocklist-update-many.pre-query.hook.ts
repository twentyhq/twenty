import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type BlocklistItem } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

@WorkspaceQueryHook(`blocklist.updateMany`)
export class BlocklistUpdateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor() {}

  async execute(): Promise<UpdateManyResolverArgs<BlocklistItem>> {
    throw new CommonQueryRunnerException(
      'Method not allowed.',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Bulk update of blocklist entries is not allowed.`,
      },
    );
  }
}
