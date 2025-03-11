import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessage,
} from 'src/modules/view/views.exception';

@WorkspaceQueryHook(`view.deleteOne`)
export class ViewDeleteOnePreQueryHook implements WorkspaceQueryHookInstance {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const targettedViewId = payload.id;

    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        'view',
      );

    const view = await viewRepository.findOne({
      where: { id: targettedViewId },
    });

    if (!view) {
      throw new ViewException(
        ViewExceptionMessage.VIEW_NOT_FOUND,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    if (view.key === 'INDEX') {
      throw new ViewException(
        ViewExceptionMessage.CANNOT_DELETE_INDEX_VIEW,
        ViewExceptionCode.CANNOT_DELETE_INDEX_VIEW,
      );
    }

    return payload;
  }
}
