import { Injectable } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const NOTE_AUTHOR_NAME = 'Setu research';

// The task's one narrow write: a Company note holding the brief, written as
// the person through the ordinary record API, only when they asked to save.
// Ids are reserved in the step checkpoint before anything is written, so a
// retried step finds its own note and never creates a second one or touches
// a note a person wrote.
@Injectable()
export class SetuAiResearchNoteService {
  constructor(
    private readonly createRecordService: CreateRecordService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async saveBrief({
    actor,
    noteId,
    noteTargetId,
    companyId,
    companyName,
    markdown,
  }: {
    actor: SetuAiActionActor;
    noteId: string;
    noteTargetId: string;
    companyId: string;
    companyName: string;
    markdown: string;
  }): Promise<string | null> {
    const createdBy = {
      source: FieldActorSource.AGENT,
      name: NOTE_AUTHOR_NAME,
      workspaceMemberId:
        actor.authContext.type === 'user'
          ? actor.authContext.workspaceMemberId
          : null,
      context: {},
    };

    if (!(await this.exists(actor, 'note', noteId))) {
      const note = await this.createRecordService.execute({
        objectName: 'note',
        objectRecord: {
          id: noteId,
          title: `Research brief: ${companyName}`,
          bodyV2: { markdown, blocknote: null },
        },
        authContext: actor.authContext,
        rolePermissionConfig: actor.rolePermissionConfig,
        createdBy,
        slimResponse: true,
      });

      if (!note.success) {
        return null;
      }
    }

    if (!(await this.exists(actor, 'noteTarget', noteTargetId))) {
      const target = await this.createRecordService.execute({
        objectName: 'noteTarget',
        objectRecord: {
          id: noteTargetId,
          noteId,
          targetCompanyId: companyId,
        },
        authContext: actor.authContext,
        rolePermissionConfig: actor.rolePermissionConfig,
        createdBy,
        slimResponse: true,
      });

      if (!target.success) {
        return null;
      }
    }

    return noteId;
  }

  private async exists(
    actor: SetuAiActionActor,
    objectNameSingular: string,
    recordId: string,
  ): Promise<boolean> {
    const record = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(objectNameSingular, actor.rolePermissionConfig)
          .findOne({ where: { id: recordId }, withDeleted: true }),
      actor.authContext,
    );

    return isDefined(record);
  }
}
