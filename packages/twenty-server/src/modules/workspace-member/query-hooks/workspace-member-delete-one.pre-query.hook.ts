import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@WorkspaceQueryHook(`workspaceMember.deleteOne`)
export class WorkspaceMemberDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    @InjectWorkspaceRepository(AttachmentWorkspaceEntity)
    private readonly attachmentRepository: WorkspaceRepository<AttachmentWorkspaceEntity>,
    @InjectWorkspaceRepository(CommentWorkspaceEntity)
    private readonly commentRepository: WorkspaceRepository<CommentWorkspaceEntity>,
  ) {}

  // There is no need to validate the user's access to the workspace member since we don't have permission yet.
  async execute(
    userId: string,
    workspaceId: string,
    payload: DeleteOneResolverArgs,
  ): Promise<void> {
    const authorId = payload.id;

    await this.attachmentRepository.delete({
      author: {
        id: authorId,
      },
    });

    await this.commentRepository.delete({
      author: {
        id: authorId,
      },
    });
  }
}
