import { Injectable } from '@nestjs/common';

import { type SetuAiTaskProjection } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { SETU_AI_TASK_MAX_ACCOUNTS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-max-accounts.constant';
import { type SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { OpenAiResearchRunnerService } from 'src/engine/metadata-modules/ai/ai-tasks/services/openai-research-runner.service';
import { SetuAiResearchContextService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-research-context.service';
import { SetuAiTaskDispatcherService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-dispatcher.service';
import {
  SetuAiTaskLedgerService,
  type SetuAiTaskProjectionResult,
} from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-ledger.service';
import { SetuAiTaskException } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task.exception';
import { type SetuAiTaskOwner } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-owner.type';
import { type SetuAiTaskRequest } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-task-request.type';
import { getSetuAiTaskTokenLimits } from 'src/engine/metadata-modules/ai/ai-tasks/utils/get-setu-ai-task-token-limits.util';
import { toSetuAiTaskProjection } from 'src/engine/metadata-modules/ai/ai-tasks/utils/to-setu-ai-task-projection.util';

// Entry point for the chat tools and the task API. Work is enqueued only
// after the state that allows it has committed.
@Injectable()
export class SetuAiTaskService {
  constructor(
    private readonly ledgerService: SetuAiTaskLedgerService,
    private readonly dispatcherService: SetuAiTaskDispatcherService,
    private readonly researchContextService: SetuAiResearchContextService,
    private readonly researchRunner: OpenAiResearchRunnerService,
  ) {}

  // Accounts are resolved with the person's own permissions before the task
  // exists; an id they cannot read is refused rather than researched.
  async startAccountResearch({
    actor,
    threadId,
    deduplicationKey,
    companyIds,
    request,
    preferredModelId,
  }: {
    actor: SetuAiActionActor;
    threadId: string | null;
    deduplicationKey: string;
    companyIds: string[];
    request: SetuAiTaskRequest;
    preferredModelId?: string;
  }): Promise<SetuAiTaskRunEntity> {
    const uniqueCompanyIds = [...new Set(companyIds)];

    if (
      uniqueCompanyIds.length === 0 ||
      uniqueCompanyIds.length > SETU_AI_TASK_MAX_ACCOUNTS
    ) {
      throw new SetuAiTaskException(
        `Research between 1 and ${SETU_AI_TASK_MAX_ACCOUNTS} accounts at a time`,
        'INVALID_INPUT',
      );
    }

    const modelId = this.researchRunner.findSupportedModelId(preferredModelId);

    if (!isDefined(modelId)) {
      throw new SetuAiTaskException(
        'No OpenAI model is available for research',
        'MODEL_UNAVAILABLE',
      );
    }

    const companies = await this.researchContextService
      .findCompanyNames({ actor, companyIds: uniqueCompanyIds })
      .catch(() => []);
    const companyById = new Map(
      companies.map((company) => [company.id, company]),
    );
    const missingCount = uniqueCompanyIds.filter(
      (companyId) => !companyById.has(companyId),
    ).length;

    if (missingCount > 0) {
      throw new SetuAiTaskException(
        `${missingCount} of the company ids could not be found. Look the companies up first and pass their exact ids.`,
        'INVALID_INPUT',
      );
    }

    const task = await this.ledgerService.createTask({
      owner: actor,
      threadId,
      deduplicationKey,
      request,
      modelId,
      tokenLimit: getSetuAiTaskTokenLimits().perTask,
      companies: uniqueCompanyIds.map(
        (companyId) =>
          companyById.get(companyId) as { id: string; name: string },
      ),
    });

    await this.dispatcherService.enqueue(task.id);

    return task;
  }

  async getProjection(
    owner: SetuAiTaskOwner,
    taskId: string,
  ): Promise<SetuAiTaskProjection> {
    const task = await this.ledgerService.findOwnedTask(owner, taskId);

    return toSetuAiTaskProjection(
      task,
      await this.ledgerService.findSteps(task.id),
    );
  }

  async findProjections(args: {
    owner: SetuAiTaskOwner;
    taskIds: string[];
  }): Promise<SetuAiTaskProjectionResult[]> {
    return this.ledgerService.findProjections(args);
  }

  async findActiveProjections(owner: SetuAiTaskOwner) {
    return this.ledgerService.findActiveProjections(owner);
  }

  async answerInput(
    args: Parameters<SetuAiTaskLedgerService['answerStepInput']>[0],
  ): Promise<SetuAiTaskProjection> {
    const task = await this.ledgerService.answerStepInput(args);

    await this.dispatcherService.enqueue(task.id);

    return this.getProjection(args.owner, task.id);
  }

  async retryStep(
    args: Parameters<SetuAiTaskLedgerService['retryStep']>[0],
  ): Promise<SetuAiTaskProjection> {
    const task = await this.ledgerService.retryStep(args);

    await this.dispatcherService.enqueue(task.id);

    return this.getProjection(args.owner, task.id);
  }

  async cancel(
    args: Parameters<SetuAiTaskLedgerService['requestCancel']>[0],
  ): Promise<SetuAiTaskProjection> {
    const task = await this.ledgerService.requestCancel(args);

    return this.getProjection(args.owner, task.id);
  }
}
