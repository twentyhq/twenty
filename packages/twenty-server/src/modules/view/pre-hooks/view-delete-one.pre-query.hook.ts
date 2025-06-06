import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
@WorkspaceQueryHook(`view.deleteOne`)
export class ViewDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    const targettedViewId = payload.id;
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        'view',
      );

    const view = await viewRepository.findOne({
      where: { id: targettedViewId },
    });

    if (!view) {
      throw new GraphqlQueryRunnerException(
        'View not found',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (view.key === 'INDEX') {
      throw new GraphqlQueryRunnerException(
        'Cannot delete INDEX view',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    return payload;
  }
}
