import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type MergeManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

// Merge hard-deletes the losing records, which would skip the destroy hooks that remove their page layouts.
@WorkspaceQueryHook(`dashboard.mergeMany`)
export class DashboardMergeManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(): Promise<MergeManyResolverArgs> {
    throw new CommonQueryRunnerException(
      'Method not allowed.',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Merging dashboards is not allowed.`,
      },
    );
  }
}
