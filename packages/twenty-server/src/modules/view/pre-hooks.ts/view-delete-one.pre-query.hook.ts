import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ViewService } from 'src/modules/view/services/view.service';

@WorkspaceQueryHook(`view.deleteOne`)
export class ViewDeleteOnePreQueryHook implements WorkspaceQueryHookInstance {
  constructor(private readonly viewService: ViewService) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const targettedViewId = payload.id;

    const view = await this.viewService.getView({
      workspaceId: authContext.workspace.id,
      id: targettedViewId,
    });

    if (!view) {
      throw new PermissionsException(
        PermissionsExceptionMessage.VIEW_NOT_FOUND,
        PermissionsExceptionCode.VIEW_NOT_FOUND,
      );
    }

    if (view.key === 'INDEX') {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_DELETE_INDEX_VIEW,
        PermissionsExceptionCode.CANNOT_DELETE_INDEX_VIEW,
      );
    }

    return payload;
  }
}
