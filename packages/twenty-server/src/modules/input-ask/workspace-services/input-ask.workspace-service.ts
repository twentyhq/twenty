import { Injectable } from '@nestjs/common';

import { type AskQuestionItem } from 'twenty-shared/ai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { IsNull, Not } from 'typeorm';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

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
  // retried run, the next item of an iterator): the previous answer belonged
  // to the previous execution, while a question still pending may be one
  // someone is looking at.
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

      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: { isCustom: false, nameSingular: 'inputAsk' },
        workspaceId,
      });

      try {
        await inputAskRepository.insert({
          name: stepName,
          status: InputAskStatus.PENDING,
          form: { fields },
          workflowRunId,
          stepId,
          position,
        });
      } catch (error) {
        // The row is already pending, whether from an earlier execution or a
        // concurrent worker
        if (!isDuplicateEntry(error)) {
          throw error;
        }
      }
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
      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: { isCustom: false, nameSingular: 'inputAsk' },
        workspaceId,
      });

      try {
        await inputAskRepository.insert({
          name,
          status: InputAskStatus.PENDING,
          form: { questions },
          workflowRunId,
          stepId,
          threadId,
          toolCallId,
          position,
        });
      } catch (error) {
        // A retried recording of the same question wants the existing row.
        if (!isDuplicateEntry(error)) {
          throw error;
        }
      }
    });
  }

  // An agent can ask several times in one conversation, so the answer is
  // matched to its question by tool call, never to whichever Ask is pending.
  // The run may already have ended and canceled it after taking the answer.
  async answerForToolCall({
    workspaceId,
    threadId,
    toolCallId,
    response,
  }: {
    workspaceId: string;
    threadId: string;
    toolCallId: string | null;
    response: Record<string, unknown>;
  }): Promise<void> {
    if (
      !isDefined(toolCallId) ||
      !(await this.hasInputAskObject(workspaceId))
    ) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      await inputAskRepository.update(
        { threadId, toolCallId, status: Not(InputAskStatus.ANSWERED) },
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
  // A form whose step completed was answered even if recording the answer
  // failed at submission, so it closes as answered from the step's result.
  async cancelPendingForWorkflowRun({
    workspaceId,
    workflowRunId,
    stepInfos,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepInfos: Record<string, WorkflowRunStepInfo>;
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      const pendingFormInputAsks = await inputAskRepository.find({
        where: {
          workflowRunId,
          status: InputAskStatus.PENDING,
          toolCallId: IsNull(),
        },
        select: { id: true, stepId: true },
      });

      for (const pendingFormInputAsk of pendingFormInputAsks) {
        const stepInfo = isDefined(pendingFormInputAsk.stepId)
          ? stepInfos[pendingFormInputAsk.stepId]
          : undefined;

        if (stepInfo?.status !== StepStatus.SUCCESS) {
          continue;
        }

        await inputAskRepository.update(
          { id: pendingFormInputAsk.id, status: InputAskStatus.PENDING },
          {
            status: InputAskStatus.ANSWERED,
            response: isPlainObject(stepInfo.result) ? stepInfo.result : null,
            answeredAt: new Date().toISOString(),
          },
        );
      }

      await inputAskRepository.update(
        { workflowRunId, status: InputAskStatus.PENDING },
        { status: InputAskStatus.CANCELED },
      );
    });
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
