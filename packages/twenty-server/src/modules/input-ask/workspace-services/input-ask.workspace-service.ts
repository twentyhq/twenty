import { Injectable } from '@nestjs/common';

import { type AskQuestionItem } from 'twenty-shared/ai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskSource } from 'src/modules/input-ask/enums/input-ask-source.enum';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const isDuplicateEntry = (error: unknown): boolean =>
  error instanceof TwentyOrmException &&
  error.code === TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED;

@Injectable()
export class InputAskWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // A run can re-enter a form it already asked about (a retried worker, a
  // retried run, the next item of an iterator) and the unique key is the step,
  // so the row is reused rather than duplicated. A row that is no longer
  // PENDING is reopened: the previous answer belonged to the previous
  // execution, and leaving it would park the run on a question nobody can
  // answer. A row already PENDING is left exactly as it is, so a resumed worker
  // does not rewrite a question someone is looking at.
  async openForFormStep({
    workspaceId,
    workflowRunId,
    stepId,
    stepName,
    fields,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    stepName: string;
    fields: FormFieldMetadata[];
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      const reopenResult = await inputAskRepository.update(
        {
          workflowRunId,
          stepId,
          toolCallId: IsNull(),
          status: Not(InputAskStatus.PENDING),
        },
        {
          name: stepName,
          status: InputAskStatus.PENDING,
          form: { fields },
          response: null,
          answeredAt: null,
        },
      );

      if ((reopenResult.affected ?? 0) > 0) {
        return;
      }

      const existingInputAsk = await inputAskRepository.findOne({
        where: { workflowRunId, stepId, toolCallId: IsNull() },
      });

      if (isDefined(existingInputAsk)) {
        return;
      }

      // Two workers can clear the read above at the same time, and the loser
      // of that race wants the winner's row rather than a failed step.
      await this.insertUnlessPresent({
        workspaceId,
        inputAskRepository,
        inputAsk: {
          name: stepName,
          form: { fields },
          workflowRunId,
          stepId,
        },
      });
    });
  }

  // Records the answer the run has already accepted. The run's own step
  // transition is what refuses a second submission, so nothing here gates
  // anything: a row that is missing, canceled or already answered simply has
  // nothing left to record.
  async answerForFormStep({
    workspaceId,
    workflowRunId,
    stepId,
    response,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    response: Record<string, unknown>;
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      await inputAskRepository.update(
        {
          workflowRunId,
          stepId,
          toolCallId: IsNull(),
          status: InputAskStatus.PENDING,
        },
        {
          status: InputAskStatus.ANSWERED,
          response,
          answeredAt: new Date().toISOString(),
        },
      );
    });
  }

  // An agent can ask several times in one conversation, each question its own
  // Ask keyed on the tool call that asked it. The conversation's pending
  // marker and the run's step stay what gate the answer; this only records
  // the question where people can find it.
  async openForAgentQuestion({
    workspaceId,
    workflowRunId,
    stepId,
    threadId,
    toolCallId,
    name,
    questions,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    threadId: string;
    toolCallId: string;
    name: string;
    questions: AskQuestionItem[];
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      // A retried recording of the same question wants the existing row.
      await this.insertUnlessPresent({
        workspaceId,
        inputAskRepository,
        inputAsk: {
          name,
          form: { questions },
          workflowRunId,
          stepId,
          threadId,
          toolCallId,
        },
      });
    });
  }

  // A conversation has at most one question pending at a time, the one its
  // pending marker points at, so the thread alone identifies the Ask.
  async answerPendingForThread({
    workspaceId,
    threadId,
    response,
  }: {
    workspaceId: string;
    threadId: string;
    response: Record<string, unknown>;
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      await inputAskRepository.update(
        { threadId, status: InputAskStatus.PENDING },
        {
          status: InputAskStatus.ANSWERED,
          response,
          answeredAt: new Date().toISOString(),
        },
      );
    });
  }

  // A run that ends before its answer arrives leaves the question unanswerable,
  // and an unanswerable question left PENDING sits in someone's list forever.
  async cancelPendingForWorkflowRun({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      await inputAskRepository.update(
        { workflowRunId, status: InputAskStatus.PENDING },
        { status: InputAskStatus.CANCELED },
      );
    });
  }

  // Assigning is not answering: whoever may read an Ask may hand it to
  // someone else, but the Ask stays SYSTEM-writable so its status and
  // response only ever change with what it gates.
  async assign({
    workspaceId,
    inputAskId,
    assigneeWorkspaceMemberId,
    authContext,
  }: {
    workspaceId: string;
    inputAskId: string;
    assigneeWorkspaceMemberId: string | null;
    authContext: WorkspaceAuthContext;
  }): Promise<boolean> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return false;
    }

    const readableInputAsk =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions<InputAskWorkspaceEntity>(
              'inputAsk',
            )
            .findOne({ where: { id: inputAskId }, select: { id: true } }),
        authContext,
      );

    if (!isDefined(readableInputAsk)) {
      return false;
    }

    return this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      if (isDefined(assigneeWorkspaceMemberId)) {
        const assignee = await this.workspaceOrmManager
          .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({ where: { id: assigneeWorkspaceMemberId } });

        if (!isDefined(assignee)) {
          return false;
        }
      }

      await inputAskRepository.update(
        { id: inputAskId },
        { assigneeId: assigneeWorkspaceMemberId },
      );

      return true;
    });
  }

  private async insertUnlessPresent({
    workspaceId,
    inputAskRepository,
    inputAsk,
  }: {
    workspaceId: string;
    inputAskRepository: WorkspaceRepository<InputAskWorkspaceEntity>;
    inputAsk: Pick<InputAskWorkspaceEntity, 'name' | 'form' | 'stepId'> &
      Partial<Pick<InputAskWorkspaceEntity, 'threadId' | 'toolCallId'>> & {
        workflowRunId: string;
      };
  }): Promise<void> {
    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: { isCustom: false, nameSingular: 'inputAsk' },
      workspaceId,
    });

    try {
      await inputAskRepository.insert({
        ...inputAsk,
        status: InputAskStatus.PENDING,
        source: InputAskSource.WORKFLOW_RUN_STEP,
        assigneeId: await this.findRunInitiatorWorkspaceMemberId(
          inputAsk.workflowRunId,
        ),
        position,
      });
    } catch (error) {
      if (!isDuplicateEntry(error)) {
        throw error;
      }
    }
  }

  // Whoever started a run is who it is waiting on unless someone reassigns
  // it; a run started by a trigger has nobody to default to.
  private async findRunInitiatorWorkspaceMemberId(
    workflowRunId: string,
  ): Promise<string | null> {
    const workflowRun = await this.workspaceOrmManager
      .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
        shouldBypassPermissionChecks: true,
      })
      .findOne({ where: { id: workflowRunId } });

    return workflowRun?.createdBy?.source === FieldActorSource.MANUAL
      ? (workflowRun.createdBy.workspaceMemberId ?? null)
      : null;
  }

  // The object reaches existing workspaces through a workspace upgrade command,
  // which runs per workspace while this code is already serving — and an
  // interrupted upgrade leaves the rest without it indefinitely. Until a
  // workspace has the object, a form step behaves exactly as it did before.
  private async hasInputAskObject(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.inputAsk.universalIdentifier
      ],
    );
  }

  private async executeAsSystem<TResult>(
    workspaceId: string,
    execute: (
      inputAskRepository: WorkspaceRepository<InputAskWorkspaceEntity>,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        execute(
          this.workspaceOrmManager.getRepository<InputAskWorkspaceEntity>(
            'inputAsk',
            { shouldBypassPermissionChecks: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
