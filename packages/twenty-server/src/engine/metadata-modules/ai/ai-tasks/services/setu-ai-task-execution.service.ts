import { Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { SetuAiActionActorService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-actor.service';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { isSetuAiActionExecutionPaused } from 'src/engine/metadata-modules/ai/ai-actions/utils/is-setu-ai-action-execution-paused.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { SETU_AI_TASK_MAX_STEP_ATTEMPTS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-max-step-attempts.constant';
import { SETU_AI_TASK_STEP_DEADLINE_MS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-step-deadline-ms.constant';
import { type SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { type SetuAiTaskStepEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-step.entity';
import { OpenAiResearchRunnerService } from 'src/engine/metadata-modules/ai/ai-tasks/services/openai-research-runner.service';
import { SetuAiResearchContextService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-research-context.service';
import { SetuAiResearchNoteService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-research-note.service';
import {
  EMPTY_SETU_AI_TASK_USAGE,
  SetuAiTaskLedgerService,
} from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-ledger.service';
import { type SetuAiResearchRunResult } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-research-run.type';
import { type SetuAiTaskStepCheckpoint } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-step-checkpoint.type';
import { buildSetuAiResearchBrief } from 'src/engine/metadata-modules/ai/ai-tasks/utils/build-setu-ai-research-brief.util';
import { buildSetuAiResearchBriefMarkdown } from 'src/engine/metadata-modules/ai/ai-tasks/utils/build-setu-ai-research-brief-markdown.util';
import { getSetuAiTaskTokenLimits } from 'src/engine/metadata-modules/ai/ai-tasks/utils/get-setu-ai-task-token-limits.util';
import { isSetuAiResearchWebSearchEnabled } from 'src/engine/metadata-modules/ai/ai-tasks/utils/is-setu-ai-research-web-search-enabled.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const CANCELLATION_POLL_INTERVAL_MS = 5_000;

export type SetuAiTaskStepRunOutcome = 'ran' | 'nothing_to_run' | 'paused';

// Runs one step of a task per call: claim, research, save, record. The
// caller enqueues the task again so the next account starts only after this
// one's result is committed. A restart re-reads the ledger, so completed
// accounts are never researched again.
@Injectable()
export class SetuAiTaskExecutionService {
  private readonly logger = new Logger(SetuAiTaskExecutionService.name);

  constructor(
    private readonly ledgerService: SetuAiTaskLedgerService,
    private readonly actorService: SetuAiActionActorService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly researchRunner: OpenAiResearchRunnerService,
    private readonly researchContextService: SetuAiResearchContextService,
    private readonly researchNoteService: SetuAiResearchNoteService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async runNextStep({
    taskId,
    leaseOwner,
  }: {
    taskId: string;
    leaseOwner: string;
  }): Promise<SetuAiTaskStepRunOutcome> {
    const task = await this.ledgerService.findById(taskId);

    if (!isDefined(task)) {
      return 'nothing_to_run';
    }

    // The kill switch and the workspace gate leave steps queued, so turning
    // them back on resumes exactly where the task stopped.
    if (
      isSetuAiActionExecutionPaused() ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED,
        task.workspaceId,
      ))
    ) {
      return 'paused';
    }

    const limits = getSetuAiTaskTokenLimits();
    const claim = await this.ledgerService.claimNextStep({
      taskId,
      leaseOwner,
      stepReservation: limits.perStepReservation,
      workspaceDailyTokenLimit: limits.perWorkspacePerDay,
    });

    if (claim.status === 'budget_exhausted') {
      return 'ran';
    }

    if (claim.status === 'nothing_to_run') {
      return 'nothing_to_run';
    }

    await this.runClaimedStep(claim.task, claim.step);

    return 'ran';
  }

  private async runClaimedStep(
    task: SetuAiTaskRunEntity,
    step: SetuAiTaskStepEntity,
  ): Promise<void> {
    const actor = await this.actorService.resolve({
      workspaceId: task.workspaceId,
      userWorkspaceId: task.initiatorUserWorkspaceId,
    });

    if (!isDefined(actor)) {
      await this.ledgerService.finishStep({
        step,
        usage: EMPTY_SETU_AI_TASK_USAGE,
        finish: { status: 'failed', errorCode: 'NOT_AVAILABLE' },
      });

      return;
    }

    // Deleting the thread stops the work it started.
    if (!(await this.isThreadStillOpen(task, actor))) {
      await this.ledgerService.cancelBySystem(task.id);
      await this.ledgerService.finishStep({
        step,
        usage: EMPTY_SETU_AI_TASK_USAGE,
        finish: { status: 'cancelled' },
      });

      return;
    }

    try {
      await this.aiBillingService.assertAiExecutionAllowed({
        workspaceId: task.workspaceId,
        operationType: UsageOperationType.AI_RESEARCH_TOKEN,
        spenders: { userWorkspaceId: actor.userWorkspaceId },
      });
    } catch {
      await this.ledgerService.finishStep({
        step,
        usage: EMPTY_SETU_AI_TASK_USAGE,
        finish: { status: 'failed', errorCode: 'BUDGET_EXHAUSTED' },
      });

      return;
    }

    const checkpoint = step.checkpoint as SetuAiTaskStepCheckpoint;
    const result = await this.runResearch(task, step, actor, checkpoint);

    this.recordUsage(task, actor, result);

    if (result.outcome === 'failed') {
      const canRetry =
        result.isRetryable && step.attempts < SETU_AI_TASK_MAX_STEP_ATTEMPTS;

      await this.ledgerService.finishStep({
        step,
        usage: result.usage,
        finish: canRetry
          ? { status: 'queued' }
          : { status: 'failed', errorCode: result.errorCode },
      });

      return;
    }

    if (result.outcome === 'clarification') {
      const answers = checkpoint.answers ?? [];
      const previousVersion = answers[answers.length - 1]?.version ?? 0;

      await this.ledgerService.finishStep({
        step,
        usage: result.usage,
        finish: {
          status: 'waiting_input',
          pendingInput: {
            version: previousVersion + 1,
            prompt: result.prompt,
            fields: result.fields,
          },
        },
      });

      return;
    }

    const brief = buildSetuAiResearchBrief({
      output: result.output,
      crmContext: result.retrievedCrmSources,
      citedUrls: result.citedUrls,
    });

    if (task.request.saveBriefsAsNotes) {
      brief.savedNoteId = await this.saveNote({
        task,
        step,
        actor,
        checkpoint,
        markdown: buildSetuAiResearchBriefMarkdown(brief),
      });
    }

    const isRecorded = await this.ledgerService.finishStep({
      step,
      usage: result.usage,
      finish: { status: 'completed', brief },
    });

    if (!isRecorded) {
      this.logger.warn(
        `Task step ${step.id} lost its claim before its brief was recorded`,
      );
    }
  }

  // The step deadline and a cancellation request both abort the run; the
  // run checks between model calls, so it stops cooperatively.
  private async runResearch(
    task: SetuAiTaskRunEntity,
    step: SetuAiTaskStepEntity,
    actor: SetuAiActionActor,
    checkpoint: SetuAiTaskStepCheckpoint,
  ): Promise<SetuAiResearchRunResult> {
    const abortController = new AbortController();
    const deadline = setTimeout(
      () => abortController.abort(),
      SETU_AI_TASK_STEP_DEADLINE_MS,
    );
    const cancellationPoll = setInterval(() => {
      void this.ledgerService
        .isCancelRequested(task.id)
        .then((isCancelRequested) => {
          if (isCancelRequested) {
            abortController.abort();
          }
        })
        .catch(() => undefined);
    }, CANCELLATION_POLL_INTERVAL_MS);

    try {
      return await this.researchRunner.run({
        modelId: task.modelId,
        companyName: step.companyName,
        focus: task.request.focus,
        answers: checkpoint.answers ?? [],
        loadCrmContext: async () => {
          const context = await this.researchContextService.load({
            actor,
            companyId: step.companyId,
          });

          if (!isDefined(context)) {
            throw new Error('Account not readable');
          }

          return context;
        },
        isWebSearchEnabled: isSetuAiResearchWebSearchEnabled(),
        tokenBudget: step.reservedTokens,
        signal: abortController.signal,
      });
    } finally {
      clearTimeout(deadline);
      clearInterval(cancellationPoll);
    }
  }

  private async saveNote({
    task,
    step,
    actor,
    checkpoint,
    markdown,
  }: {
    task: SetuAiTaskRunEntity;
    step: SetuAiTaskStepEntity;
    actor: SetuAiActionActor;
    checkpoint: SetuAiTaskStepCheckpoint;
    markdown: string;
  }): Promise<string | null> {
    const reservedCheckpoint: SetuAiTaskStepCheckpoint = {
      ...checkpoint,
      reservedNoteId: checkpoint.reservedNoteId ?? randomUUID(),
      reservedNoteTargetId: checkpoint.reservedNoteTargetId ?? randomUUID(),
    };

    // Reserved before writing, so a crash after the note exists leads the
    // retry back to the same note.
    const isReserved = await this.ledgerService.saveCheckpoint({
      step,
      checkpoint: reservedCheckpoint,
    });

    if (!isReserved) {
      return null;
    }

    try {
      return await this.researchNoteService.saveBrief({
        actor,
        noteId: reservedCheckpoint.reservedNoteId as string,
        noteTargetId: reservedCheckpoint.reservedNoteTargetId as string,
        companyId: step.companyId,
        companyName: step.companyName,
        markdown,
      });
    } catch (error) {
      this.logger.warn(
        `Could not save the brief note for task ${task.id}: ${error instanceof Error ? error.name : 'error'}`,
      );

      return null;
    }
  }

  // Counted once per step attempt, including failed runs that reported
  // usage, through the same accounting as chat.
  private recordUsage(
    task: SetuAiTaskRunEntity,
    actor: SetuAiActionActor,
    result: SetuAiResearchRunResult,
  ): void {
    if (result.usage.totalTokens > 0) {
      void this.aiBillingService
        .calculateAndBillUsage(
          task.modelId,
          {
            usage: {
              inputTokens: result.usage.inputTokens,
              outputTokens: result.usage.outputTokens,
            },
          },
          task.workspaceId,
          UsageOperationType.AI_RESEARCH_TOKEN,
          null,
          actor.userWorkspaceId,
        )
        .catch(() => undefined);
    }

    void this.aiBillingService
      .billNativeWebSearchUsage(
        result.usage.webSearchCalls,
        task.workspaceId,
        actor.userWorkspaceId,
      )
      .catch(() => undefined);
  }

  private async isThreadStillOpen(
    task: SetuAiTaskRunEntity,
    actor: SetuAiActionActor,
  ): Promise<boolean> {
    if (!isDefined(task.threadId)) {
      return true;
    }

    try {
      const thread = await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository('agentChatThread', actor.rolePermissionConfig)
            .findOne({ where: { id: task.threadId }, select: { id: true } }),
        actor.authContext,
      );

      return isDefined(thread);
    } catch {
      return false;
    }
  }
}
