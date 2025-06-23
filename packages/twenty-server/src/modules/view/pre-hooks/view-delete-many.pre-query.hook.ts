import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`view.deleteMany`)
export class ViewDeleteManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor() {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    _payload: DeleteManyResolverArgs,
  ): Promise<DeleteManyResolverArgs> {
    throw new GraphqlQueryRunnerException(
      'Method not implemented',
      GraphqlQueryRunnerExceptionCode.NOT_IMPLEMENTED,
    );
  }
}
