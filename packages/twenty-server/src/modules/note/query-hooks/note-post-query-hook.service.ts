import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';

@Injectable()
export class NotePostQueryHookService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async handleNoteTargetsDelete(
    authContext: AuthContext,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const noteTargetRepository =
        await this.globalWorkspaceOrmManager.getRepository<NoteTargetWorkspaceEntity>(
          workspace.id,
          'noteTarget',
        );

      await noteTargetRepository.softDelete({
        noteId: In(payload.map((note) => note.id)),
      });
    }, authContext as WorkspaceAuthContext);
  }

  async handleNoteTargetsRestore(
    authContext: AuthContext,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const noteTargetRepository =
        await this.globalWorkspaceOrmManager.getRepository<NoteTargetWorkspaceEntity>(
          workspace.id,
          'noteTarget',
        );

      await noteTargetRepository.restore({
        noteId: In(payload.map((note) => note.id)),
      });
    }, authContext as WorkspaceAuthContext);
  }
}
