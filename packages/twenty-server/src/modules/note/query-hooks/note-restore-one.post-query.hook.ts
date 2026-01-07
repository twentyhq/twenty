import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { NotePostQueryHookService } from 'src/modules/note/query-hooks/note-post-query-hook.service';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: `note.restoreOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class NoteRestoreOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly notePostQueryHookService: NotePostQueryHookService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    await this.notePostQueryHookService.handleNoteTargetsRestore(
      authContext,
      payload,
    );
  }
}
