import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type RestoreManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

@WorkspaceQueryHook(`blocklist.restoreMany`)
export class BlocklistRestoreManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(): Promise<RestoreManyResolverArgs> {
    throw new CommonQueryRunnerException(
      'Method not allowed.',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Bulk restoration of blocklist entries is not allowed.`,
      },
    );
  }
}
