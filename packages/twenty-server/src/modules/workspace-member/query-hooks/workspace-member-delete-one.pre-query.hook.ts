import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@WorkspaceQueryHook(`workspaceMember.deleteOne`)
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  // There is no need to validate the user's access to the workspace member since we don't have permission yet.
  async execute(
    userId: string,
    workspaceId: string,
    payload: DeleteOneResolverArgs,
  ): Promise<void> {
    const attachmentRepository =
      await this.twentyORMManager.getRepository<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const commentRepository =
      await this.twentyORMManager.getRepository<CommentWorkspaceEntity>(
        'comment',
      );

    const authorId = payload.id;

    await attachmentRepository.delete({
      authorId,
    });

    await commentRepository.delete({
      authorId,
    });
  }
}
