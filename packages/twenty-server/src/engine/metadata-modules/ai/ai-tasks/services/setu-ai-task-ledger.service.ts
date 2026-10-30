import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  SETU_AI_TASK_TERMINAL_STATUSES,
  type RequestFormField,
  type SetuAiErrorCode,
  type SetuAiResearchBrief,
  type SetuAiTaskPendingInput,
  type SetuAiTaskProjection,
  type SetuAiTaskStepStatus,
  validateAiFormAnswers,
} from 'twenty-shared/ai';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { type EntityManager, In, LessThan, type Repository } from 'typeorm';

import { SETU_AI_TASK_MAX_STEP_ATTEMPTS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-max-step-attempts.constant';
import { SETU_AI_TASK_POLICY_VERSION } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-policy-version.constant';
import { SETU_AI_TASK_STEP_LEASE_DURATION_MS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-step-lease-duration-ms.constant';
import { SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { SetuAiTaskStepEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-step.entity';
import { SetuAiTaskException } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task.exception';
import { type SetuAiTaskOwner } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-owner.type';
import { type SetuAiTaskRequest } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-request.type';
import {
  type SetuAiTaskAnswerValue,
  type SetuAiTaskStepCheckpoint,
} from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-step-checkpoint.type';
import { type SetuAiTaskUsage } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-usage.type';
import { deriveSetuAiTaskStatus } from 'src/engine/metadata-modules/ai/ai-tasks/utils/derive-setu-ai-task-status.util';
import { toSetuAiTaskProjection } from 'src/engine/metadata-modules/ai/ai-tasks/utils/to-setu-ai-task-projection.util';

// Below this, a step could not produce a brief, so it is not started.
const MINIMUM_STEP_TOKENS = 5_000;

export const EMPTY_SETU_AI_TASK_USAGE: SetuAiTaskUsage = {
  requests: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  webSearchCalls: 0,
};

export type SetuAiTaskProjectionResult =
  | { requestedId: string; status: 'available'; task: SetuAiTaskProjection }
  | { requestedId: string; status: 'unavailable' };

export type SetuAiTaskStepClaim =
  | { status: 'claimed'; task: SetuAiTaskRunEntity; step: SetuAiTaskStepEntity }
  | { status: 'budget_exhausted' }
  | { status: 'nothing_to_run' };

type StepFinish = {
  status: Extract<
    SetuAiTaskStepStatus,
    'completed' | 'failed' | 'waiting_input' | 'queued' | 'cancelled'
  >;
  brief?: SetuAiResearchBrief | null;
  pendingInput?: SetuAiTaskPendingInput | null;
  errorCode?: SetuAiErrorCode | null;
};

// Task and step state. Every transition locks the task row first, then its
// steps, so a claim, an answer, a retry and a cancellation never interleave.
// Redis jobs only point at tasks here; these tables are the source of truth.
@Injectable()
export class SetuAiTaskLedgerService {
  // Unscoped on purpose: the dispatcher scans every workspace and workers
  // address rows by id. Every caller-facing query filters on the owner's
  // workspaceId explicitly.
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(SetuAiTaskRunEntity)
    private readonly taskRepository: Repository<SetuAiTaskRunEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(SetuAiTaskStepEntity)
    private readonly stepRepository: Repository<SetuAiTaskStepEntity>,
  ) {}

  async createTask({
    owner,
    threadId,
    deduplicationKey,
    request,
    modelId,
    tokenLimit,
    companies,
  }: {
    owner: SetuAiTaskOwner;
    threadId: string | null;
    deduplicationKey: string;
    request: SetuAiTaskRequest;
    modelId: string;
    tokenLimit: number;
    companies: { id: string; name: string }[];
  }): Promise<SetuAiTaskRunEntity> {
    const existing = await this.taskRepository.findOne({
      where: { workspaceId: owner.workspaceId, deduplicationKey },
    });

    if (isDefined(existing)) {
      return existing;
    }

    try {
      return await this.taskRepository.manager.transaction(async (manager) => {
        const task = await manager.getRepository(SetuAiTaskRunEntity).save(
          manager.getRepository(SetuAiTaskRunEntity).create({
            workspaceId: owner.workspaceId,
            threadId,
            initiatorUserWorkspaceId: owner.userWorkspaceId,
            kind: 'account_research',
            request,
            status: 'queued',
            stateVersion: 1,
            deduplicationKey,
            policyVersion: SETU_AI_TASK_POLICY_VERSION,
            modelId,
            tokenLimit,
            usage: EMPTY_SETU_AI_TASK_USAGE,
          }),
        );

        await manager.getRepository(SetuAiTaskStepEntity).save(
          companies.map((company, position) =>
            manager.getRepository(SetuAiTaskStepEntity).create({
              workspaceId: owner.workspaceId,
              taskId: task.id,
              stepKey: `company:${company.id}`,
              position,
              companyId: company.id,
              companyName: company.name,
              status: 'queued',
            }),
          ),
        );

        return task;
      });
    } catch (error) {
      // A concurrent retry of the same tool call won the insert.
      const raced = await this.taskRepository.findOne({
        where: { workspaceId: owner.workspaceId, deduplicationKey },
      });

      if (isDefined(raced)) {
        return raced;
      }

      throw error;
    }
  }

  async findById(taskId: string): Promise<SetuAiTaskRunEntity | null> {
    return this.taskRepository.findOne({ where: { id: taskId } });
  }

  async findSteps(taskId: string): Promise<SetuAiTaskStepEntity[]> {
    return this.stepRepository.find({
      where: { taskId },
      order: { position: 'ASC' },
    });
  }

  async findOwnedTask(
    owner: SetuAiTaskOwner,
    taskId: string,
  ): Promise<SetuAiTaskRunEntity> {
    const task = isValidUuid(taskId)
      ? await this.taskRepository.findOne({
          where: { id: taskId, workspaceId: owner.workspaceId },
        })
      : null;

    if (
      !isDefined(task) ||
      task.initiatorUserWorkspaceId !== owner.userWorkspaceId
    ) {
      throw new SetuAiTaskException('Task not available', 'NOT_AVAILABLE');
    }

    return task;
  }

  // Inaccessible, foreign and missing ids all read the same, so a caller
  // learns nothing about tasks that are not theirs.
  async findProjections({
    owner,
    taskIds,
  }: {
    owner: SetuAiTaskOwner;
    taskIds: string[];
  }): Promise<SetuAiTaskProjectionResult[]> {
    const validIds = taskIds.filter(isValidUuid);
    const tasks =
      validIds.length > 0
        ? await this.taskRepository.find({
            where: {
              id: In(validIds),
              workspaceId: owner.workspaceId,
              initiatorUserWorkspaceId: owner.userWorkspaceId,
            },
          })
        : [];
    const projectionById = await this.toProjections(tasks);

    return taskIds.map((requestedId) => {
      const task = projectionById.get(requestedId);

      return isDefined(task)
        ? { requestedId, status: 'available', task }
        : { requestedId, status: 'unavailable' };
    });
  }

  async findActiveProjections(
    owner: SetuAiTaskOwner,
  ): Promise<{ task: SetuAiTaskProjection; threadId: string | null }[]> {
    const tasks = await this.taskRepository.find({
      where: {
        workspaceId: owner.workspaceId,
        initiatorUserWorkspaceId: owner.userWorkspaceId,
        status: In(['queued', 'running', 'waiting_input', 'cancel_requested']),
      },
      order: { createdAt: 'DESC' },
      take: 20,
    });
    const projectionById = await this.toProjections(tasks);

    return tasks.flatMap((task) => {
      const projection = projectionById.get(task.id);

      return isDefined(projection)
        ? [{ task: projection, threadId: task.threadId }]
        : [];
    });
  }

  // Steps run one at a time per task, in order, so each account's result is
  // committed before the next account starts. The budget check and the
  // reservation happen under a per-workspace lock, so concurrent tasks
  // cannot together overspend the shared daily ceiling.
  async claimNextStep({
    taskId,
    leaseOwner,
    stepReservation,
    workspaceDailyTokenLimit,
  }: {
    taskId: string;
    leaseOwner: string;
    stepReservation: number;
    workspaceDailyTokenLimit: number;
  }): Promise<SetuAiTaskStepClaim> {
    return this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);

      if (!isDefined(task) || isDefined(task.cancelRequestedAt)) {
        return { status: 'nothing_to_run' };
      }

      const steps = await this.lockSteps(manager, taskId);

      if (steps.some((step) => step.status === 'running')) {
        return { status: 'nothing_to_run' };
      }

      const nextStep = steps.find((step) => step.status === 'queued');

      if (!isDefined(nextStep)) {
        return { status: 'nothing_to_run' };
      }

      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `setu-ai-task-budget:${task.workspaceId}`,
      ]);

      const [{ committedTokens }] = (await manager.query(
        `SELECT COALESCE(SUM(CASE WHEN "status" = 'running' THEN GREATEST("reservedTokens", "usedTokens") ELSE "usedTokens" END), 0)::bigint AS "committedTokens"
         FROM "core"."setuAiTaskStep"
         WHERE "workspaceId" = $1 AND "updatedAt" >= date_trunc('day', now())`,
        [task.workspaceId],
      )) as { committedTokens: string }[];

      const taskRemainingTokens = task.tokenLimit - task.usage.totalTokens;
      const reservation = Math.min(stepReservation, taskRemainingTokens);

      if (
        reservation < MINIMUM_STEP_TOKENS ||
        Number(committedTokens) + reservation > workspaceDailyTokenLimit
      ) {
        await this.updateStep(manager, nextStep, {
          status: 'failed',
          errorCode: 'BUDGET_EXHAUSTED',
        });
        await this.refreshTaskStatus(manager, task);

        return { status: 'budget_exhausted' };
      }

      await manager.update(
        SetuAiTaskStepEntity,
        { id: nextStep.id },
        {
          status: 'running',
          attempts: nextStep.attempts + 1,
          leaseOwner,
          leaseExpiresAt: new Date(
            Date.now() + SETU_AI_TASK_STEP_LEASE_DURATION_MS,
          ),
          fencingToken: nextStep.fencingToken + 1,
          stateVersion: nextStep.stateVersion + 1,
          reservedTokens: reservation,
          errorCode: null,
        },
      );

      const claimedStep = await manager
        .getRepository(SetuAiTaskStepEntity)
        .findOneOrFail({ where: { id: nextStep.id } });

      const refreshedTask = await this.refreshTaskStatus(manager, task);

      return { status: 'claimed', task: refreshedTask, step: claimedStep };
    });
  }

  async saveCheckpoint({
    step,
    checkpoint,
  }: {
    step: SetuAiTaskStepEntity;
    checkpoint: SetuAiTaskStepCheckpoint;
  }): Promise<boolean> {
    const result = await this.stepRepository.update(
      { id: step.id, status: 'running', fencingToken: step.fencingToken },
      { checkpoint },
    );

    return (result.affected ?? 0) === 1;
  }

  // Usage is added to the task even when the claim was lost: the model calls
  // happened and must be counted once.
  async finishStep({
    step,
    usage,
    finish,
  }: {
    step: SetuAiTaskStepEntity;
    usage: SetuAiTaskUsage;
    finish: StepFinish;
  }): Promise<boolean> {
    return this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, step.taskId);

      if (!isDefined(task)) {
        return false;
      }

      await manager.update(
        SetuAiTaskRunEntity,
        { id: task.id },
        { usage: this.addUsage(task.usage, usage) },
      );
      task.usage = this.addUsage(task.usage, usage);

      const result = await manager.update(
        SetuAiTaskStepEntity,
        { id: step.id, status: 'running', fencingToken: step.fencingToken },
        {
          // A step stopped by a cancellation request ends as cancelled even
          // if the run happened to finish; its work is still kept.
          status:
            isDefined(task.cancelRequestedAt) && finish.status !== 'completed'
              ? 'cancelled'
              : finish.status,
          brief: finish.brief ?? null,
          pendingInput: finish.pendingInput ?? null,
          errorCode: finish.errorCode ?? null,
          usedTokens: step.usedTokens + usage.totalTokens,
          reservedTokens: 0,
          leaseOwner: null,
          leaseExpiresAt: null,
          stateVersion: step.stateVersion + 1,
          completedAt: finish.status === 'completed' ? new Date() : null,
        },
      );

      await this.refreshTaskStatus(manager, task);

      return (result.affected ?? 0) === 1;
    });
  }

  async answerStepInput({
    owner,
    taskId,
    stepId,
    inputVersion,
    values,
    clientRequestId,
  }: {
    owner: SetuAiTaskOwner;
    taskId: string;
    stepId: string;
    inputVersion: number;
    values: Record<string, unknown>;
    clientRequestId: string;
  }): Promise<SetuAiTaskRunEntity> {
    return this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockOwnedTask(manager, owner, taskId);
      const step = (await this.lockSteps(manager, taskId)).find(
        (candidate) => candidate.id === stepId,
      );

      if (!isDefined(step)) {
        throw new SetuAiTaskException('Step not available', 'NOT_AVAILABLE');
      }

      // A repeated answer returns the outcome it already established and
      // never makes the step runnable a second time.
      if (step.lastRequestId === clientRequestId) {
        return task;
      }

      if (isDefined(task.cancelRequestedAt)) {
        throw new SetuAiTaskException('Task cancelled', 'NOT_REVIEWABLE');
      }

      const pendingInput = step.pendingInput as SetuAiTaskPendingInput | null;

      if (step.status !== 'waiting_input' || !isDefined(pendingInput)) {
        throw new SetuAiTaskException('Step not waiting', 'NOT_REVIEWABLE');
      }

      if (pendingInput.version !== inputVersion) {
        throw new SetuAiTaskException('Stale input version', 'STALE_VERSION');
      }

      const errors = validateAiFormAnswers({
        fields: pendingInput.fields as RequestFormField[],
        values,
      });

      if (errors.length > 0) {
        throw new SetuAiTaskException(errors.join(' '), 'INVALID_INPUT');
      }

      const checkpoint = step.checkpoint as SetuAiTaskStepCheckpoint;

      await this.updateStep(manager, step, {
        status: 'queued',
        pendingInput: null,
        attempts: 0,
        lastRequestId: clientRequestId,
        checkpoint: {
          ...checkpoint,
          answers: [
            ...(checkpoint.answers ?? []),
            {
              version: inputVersion,
              prompt: pendingInput.prompt,
              values: values as Record<string, SetuAiTaskAnswerValue>,
            },
          ],
        },
      });

      return this.refreshTaskStatus(manager, task);
    });
  }

  async retryStep({
    owner,
    taskId,
    stepId,
    expectedStateVersion,
    clientRequestId,
  }: {
    owner: SetuAiTaskOwner;
    taskId: string;
    stepId: string;
    expectedStateVersion: number;
    clientRequestId: string;
  }): Promise<SetuAiTaskRunEntity> {
    return this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockOwnedTask(manager, owner, taskId);
      const step = (await this.lockSteps(manager, taskId)).find(
        (candidate) => candidate.id === stepId,
      );

      if (!isDefined(step)) {
        throw new SetuAiTaskException('Step not available', 'NOT_AVAILABLE');
      }

      if (step.lastRequestId === clientRequestId) {
        return task;
      }

      if (isDefined(task.cancelRequestedAt) || step.status !== 'failed') {
        throw new SetuAiTaskException('Step not retryable', 'NOT_REVIEWABLE');
      }

      if (step.stateVersion !== expectedStateVersion) {
        throw new SetuAiTaskException('Stale step version', 'STALE_VERSION');
      }

      await this.updateStep(manager, step, {
        status: 'queued',
        attempts: 0,
        errorCode: null,
        lastRequestId: clientRequestId,
      });

      return this.refreshTaskStatus(manager, task);
    });
  }

  // Unclaimed steps stop at once; a running step is asked to stop and ends
  // cooperatively. Completed briefs stay.
  async requestCancel({
    owner,
    taskId,
    expectedStateVersion,
    clientRequestId,
  }: {
    owner: SetuAiTaskOwner;
    taskId: string;
    expectedStateVersion: number;
    clientRequestId: string;
  }): Promise<SetuAiTaskRunEntity> {
    return this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockOwnedTask(manager, owner, taskId);

      if (task.cancelRequestId === clientRequestId) {
        return task;
      }

      if (
        SETU_AI_TASK_TERMINAL_STATUSES.includes(task.status) ||
        isDefined(task.cancelRequestedAt)
      ) {
        throw new SetuAiTaskException(
          'Task already finished',
          'NOT_REVIEWABLE',
        );
      }

      if (task.stateVersion !== expectedStateVersion) {
        throw new SetuAiTaskException('Stale task version', 'STALE_VERSION');
      }

      return this.cancelLockedTask(manager, task, clientRequestId);
    });
  }

  // Used when the thread that owns the task is gone or its owner lost access.
  async cancelBySystem(taskId: string): Promise<void> {
    await this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, taskId);

      if (!isDefined(task) || isDefined(task.cancelRequestedAt)) {
        return;
      }

      await this.cancelLockedTask(manager, task, null);
    });
  }

  async findRunnableTaskIds(limit: number): Promise<{ id: string }[]> {
    return this.taskRepository.query(
      `SELECT "task"."id" FROM "core"."setuAiTaskRun" "task"
       WHERE "task"."status" IN ('queued', 'running', 'waiting_input')
         AND "task"."cancelRequestedAt" IS NULL
         AND EXISTS (SELECT 1 FROM "core"."setuAiTaskStep" "step" WHERE "step"."taskId" = "task"."id" AND "step"."status" = 'queued')
         AND NOT EXISTS (SELECT 1 FROM "core"."setuAiTaskStep" "step" WHERE "step"."taskId" = "task"."id" AND "step"."status" = 'running')
       ORDER BY "task"."createdAt" ASC
       LIMIT $1`,
      [limit],
    );
  }

  async findStepsWithExpiredLease(
    limit: number,
  ): Promise<SetuAiTaskStepEntity[]> {
    return this.stepRepository.find({
      where: { status: 'running', leaseExpiresAt: LessThan(new Date()) },
      take: limit,
    });
  }

  // A vanished worker leaves a running step behind. It is retried while it
  // has attempts left; completed steps of the same task are never touched.
  async resolveAbandonedStep(step: SetuAiTaskStepEntity): Promise<void> {
    await this.taskRepository.manager.transaction(async (manager) => {
      const task = await this.lockTask(manager, step.taskId);

      if (!isDefined(task)) {
        return;
      }

      const canRetry =
        !isDefined(task.cancelRequestedAt) &&
        step.attempts < SETU_AI_TASK_MAX_STEP_ATTEMPTS;

      await manager.update(
        SetuAiTaskStepEntity,
        { id: step.id, status: 'running', fencingToken: step.fencingToken },
        {
          status: isDefined(task.cancelRequestedAt)
            ? 'cancelled'
            : canRetry
              ? 'queued'
              : 'failed',
          errorCode: canRetry ? null : 'TIMED_OUT',
          usedTokens: step.usedTokens + step.reservedTokens,
          reservedTokens: 0,
          leaseOwner: null,
          leaseExpiresAt: null,
          fencingToken: step.fencingToken + 1,
          stateVersion: step.stateVersion + 1,
        },
      );

      await this.refreshTaskStatus(manager, task);
    });
  }

  async isCancelRequested(taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      select: { id: true, cancelRequestedAt: true },
    });

    return !isDefined(task) || isDefined(task.cancelRequestedAt);
  }

  private async cancelLockedTask(
    manager: EntityManager,
    task: SetuAiTaskRunEntity,
    clientRequestId: string | null,
  ): Promise<SetuAiTaskRunEntity> {
    for (const step of await this.lockSteps(manager, task.id)) {
      if (step.status === 'queued' || step.status === 'waiting_input') {
        await this.updateStep(manager, step, {
          status: 'cancelled',
          pendingInput: null,
        });
      }
    }

    const changes = {
      cancelRequestedAt: new Date(),
      cancelRequestId: clientRequestId,
    };

    await manager.update(SetuAiTaskRunEntity, { id: task.id }, changes);

    return this.refreshTaskStatus(manager, { ...task, ...changes });
  }

  private async refreshTaskStatus(
    manager: EntityManager,
    task: SetuAiTaskRunEntity,
  ): Promise<SetuAiTaskRunEntity> {
    const steps = await manager.getRepository(SetuAiTaskStepEntity).find({
      where: { taskId: task.id },
      select: { status: true, errorCode: true },
    });
    const status = deriveSetuAiTaskStatus({
      stepStatuses: steps.map((step) => step.status),
      isCancelRequested: isDefined(task.cancelRequestedAt),
    });

    if (status === task.status) {
      return task;
    }

    const isTerminal = SETU_AI_TASK_TERMINAL_STATUSES.includes(status);
    const changes = {
      status,
      stateVersion: task.stateVersion + 1,
      finishedAt: isTerminal ? new Date() : null,
      errorCode:
        isTerminal &&
        steps.some((step) => step.errorCode === 'BUDGET_EXHAUSTED')
          ? ('BUDGET_EXHAUSTED' as const)
          : null,
    };

    await manager.update(SetuAiTaskRunEntity, { id: task.id }, changes);

    return manager.getRepository(SetuAiTaskRunEntity).merge(task, changes);
  }

  private async lockTask(
    manager: EntityManager,
    taskId: string,
  ): Promise<SetuAiTaskRunEntity | null> {
    return manager
      .getRepository(SetuAiTaskRunEntity)
      .createQueryBuilder('task')
      .setLock('pessimistic_write')
      .where('task.id = :taskId', { taskId })
      .getOne();
  }

  private async lockOwnedTask(
    manager: EntityManager,
    owner: SetuAiTaskOwner,
    taskId: string,
  ): Promise<SetuAiTaskRunEntity> {
    const task = isValidUuid(taskId)
      ? await this.lockTask(manager, taskId)
      : null;

    if (
      !isDefined(task) ||
      task.workspaceId !== owner.workspaceId ||
      task.initiatorUserWorkspaceId !== owner.userWorkspaceId
    ) {
      throw new SetuAiTaskException('Task not available', 'NOT_AVAILABLE');
    }

    return task;
  }

  private async lockSteps(
    manager: EntityManager,
    taskId: string,
  ): Promise<SetuAiTaskStepEntity[]> {
    return manager
      .getRepository(SetuAiTaskStepEntity)
      .createQueryBuilder('step')
      .setLock('pessimistic_write')
      .where('step.taskId = :taskId', { taskId })
      .orderBy('step.position', 'ASC')
      .getMany();
  }

  private async updateStep(
    manager: EntityManager,
    step: SetuAiTaskStepEntity,
    changes: Partial<
      Pick<
        SetuAiTaskStepEntity,
        | 'status'
        | 'errorCode'
        | 'pendingInput'
        | 'attempts'
        | 'lastRequestId'
        | 'checkpoint'
      >
    >,
  ): Promise<void> {
    await manager.update(
      SetuAiTaskStepEntity,
      { id: step.id },
      { ...changes, stateVersion: step.stateVersion + 1 },
    );
  }

  private addUsage(
    left: SetuAiTaskUsage,
    right: SetuAiTaskUsage,
  ): SetuAiTaskUsage {
    return {
      requests: left.requests + right.requests,
      inputTokens: left.inputTokens + right.inputTokens,
      outputTokens: left.outputTokens + right.outputTokens,
      totalTokens: left.totalTokens + right.totalTokens,
      webSearchCalls: left.webSearchCalls + right.webSearchCalls,
    };
  }

  private async toProjections(
    tasks: SetuAiTaskRunEntity[],
  ): Promise<Map<string, SetuAiTaskProjection>> {
    const steps =
      tasks.length > 0
        ? await this.stepRepository.find({
            where: { taskId: In(tasks.map((task) => task.id)) },
          })
        : [];

    return new Map(
      tasks.map((task) => [
        task.id,
        toSetuAiTaskProjection(
          task,
          steps.filter((step) => step.taskId === task.id),
        ),
      ]),
    );
  }
}
