import { Injectable } from '@nestjs/common';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: `note.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class NoteDeleteOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspaceId = authContext.workspace?.id;

    if (!workspaceId) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext as WorkspaceAuthContext,
      async () => {
        const noteTargetRepository =
          await this.globalWorkspaceOrmManager.getRepository<NoteTargetWorkspaceEntity>(
            workspaceId,
            'noteTarget',
          );

        await noteTargetRepository.softDelete({ noteId: payload[0].id });
      },
    );
  }
}
