import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessage,
} from 'src/modules/view/views.exception';

@WorkspaceQueryHook(`view.deleteMany`)
export class ViewDeleteManyPreQueryHook implements WorkspaceQueryHookInstance {
  constructor() {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    _payload: DeleteManyResolverArgs,
  ): Promise<DeleteManyResolverArgs> {
    throw new ViewException(
      ViewExceptionMessage.METHOD_NOT_IMPLEMENTED,
      ViewExceptionCode.METHOD_NOT_IMPLEMENTED,
    );
  }
}
