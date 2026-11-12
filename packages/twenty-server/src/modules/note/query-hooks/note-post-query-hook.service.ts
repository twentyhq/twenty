import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { getLastDeletedRecordIdsByParentId } from 'src/utils/get-last-deleted-record-ids-by-parent-id.util';

@Injectable()
export class NotePostQueryHookService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async handleNoteTargetsDelete(
    authContext: WorkspaceAuthContext,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const noteTargetRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<NoteTargetWorkspaceEntity>(
          'noteTarget',
        );

      await noteTargetRepository.softDelete({
        noteId: In(payload.map((note) => note.id)),
      });
    }, authContext);
  }

  async handleNoteTargetsRestore(
    authContext: WorkspaceAuthContext,
    payload: NoteWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const noteTargetRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<NoteTargetWorkspaceEntity>(
          'noteTarget',
        );

      const deletedNoteTargets = await noteTargetRepository.find({
        where: {
          noteId: In(payload.map((note) => note.id)),
          deletedAt: Not(IsNull()),
        },
        select: { id: true, noteId: true, deletedAt: true },
        withDeleted: true,
      });

      const noteTargetIdsToRestore = getLastDeletedRecordIdsByParentId(
        deletedNoteTargets.map(({ id, noteId, deletedAt }) => ({
          id,
          parentId: noteId,
          deletedAt,
        })),
      );

      if (noteTargetIdsToRestore.length === 0) {
        return;
      }

      await noteTargetRepository.restore({
        id: In(noteTargetIdsToRestore),
      });
    }, authContext);
  }
}
