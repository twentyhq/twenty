import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@WorkspaceQueryHook(`workspaceMember.deleteOne`)
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  // There is no need to validate the user's access to the workspace member since we don't have permission yet.
  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const attachmentRepository =
      await this.twentyORMManager.getRepository<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const authorId = payload.id;

    await attachmentRepository.delete({
      authorId,
    });

    return payload;
  }
}
