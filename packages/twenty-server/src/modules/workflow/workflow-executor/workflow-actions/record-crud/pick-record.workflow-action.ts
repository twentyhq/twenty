import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowPickRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-pick-record-action.guard';
import {
  type WorkflowPickRecordActionInput,
  type WorkflowPickRecordLoadBalance,
  type WorkflowPickRecordStrategy,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-pick-record-action-input.type';

const ROUND_ROBIN_CURSOR_TTL_MS = 1000 * 60 * 60 * 24 * 90;

type PickRecordExecutionContext = Awaited<
  ReturnType<WorkflowExecutionContextService['getExecutionContext']>
>;

const LOAD_BALANCED_COUNT_CONCURRENCY = 5;

@Injectable()
export class PickRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      steps,
      stepId: currentStepId,
    });

    if (!isWorkflowPickRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a pick record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { objectName, strategy, recordIds, loadBalance } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowPickRecordActionInput;

    if (!isNonEmptyString(objectName) || !Array.isArray(recordIds)) {
      return { error: 'Pick record action received invalid input' };
    }

    if (recordIds.length === 0) {
      return { error: 'Pick record action has no candidate records' };
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const findRecordsOutput = await this.findRecordsService.execute({
      objectName,
      filter: { id: { in: recordIds } },
      authContext: executionContext.authContext,
      rolePermissionConfig: executionContext.rolePermissionConfig,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!findRecordsOutput.success) {
      return { error: findRecordsOutput.error || findRecordsOutput.message };
    }

    const candidateRecords = (findRecordsOutput.result?.records ??
      []) as ObjectRecord[];

    if (candidateRecords.length === 0) {
      return {
        error: 'Pick record action could not find any of the candidate records',
      };
    }

    const orderedRecords = [...candidateRecords].sort((recordA, recordB) =>
      String(recordA.id).localeCompare(String(recordB.id)),
    );

    if (strategy === 'LOAD_BALANCED') {
      if (!isDefined(loadBalance)) {
        return {
          error:
            'Pick record action is missing its load balancing configuration',
        };
      }

      const leastLoadedResult = await this.getLeastLoadedIndex({
        orderedRecords,
        loadBalance,
        executionContext,
      });

      if ('error' in leastLoadedResult) {
        return { error: leastLoadedResult.error };
      }

      return { result: orderedRecords[leastLoadedResult.index] };
    }

    const pickedIndex = await this.getPickedIndex({
      strategy,
      candidateCount: orderedRecords.length,
      workspaceId: runInfo.workspaceId,
      stepId: currentStepId,
    });

    return { result: orderedRecords[pickedIndex] };
  }

  private async getLeastLoadedIndex({
    orderedRecords,
    loadBalance,
    executionContext,
  }: {
    orderedRecords: ObjectRecord[];
    loadBalance: WorkflowPickRecordLoadBalance;
    executionContext: PickRecordExecutionContext;
  }): Promise<{ index: number } | { error: string }> {
    const relatedCounts: number[] = [];

    // Count one related set per candidate, bounded by a fixed concurrency so a
    // large pool cannot fan out into an unbounded number of parallel queries.
    for (
      let batchStart = 0;
      batchStart < orderedRecords.length;
      batchStart += LOAD_BALANCED_COUNT_CONCURRENCY
    ) {
      const batch = orderedRecords.slice(
        batchStart,
        batchStart + LOAD_BALANCED_COUNT_CONCURRENCY,
      );

      const batchOutputs = await Promise.all(
        batch.map((record) =>
          this.findRecordsService.execute({
            objectName: loadBalance.objectNameSingular,
            filter: { [loadBalance.fieldName]: { id: { eq: record.id } } },
            authContext: executionContext.authContext,
            rolePermissionConfig: executionContext.rolePermissionConfig,
            shouldBuildEffectiveSelectFields: false,
            limit: 1,
          }),
        ),
      );

      for (const countOutput of batchOutputs) {
        if (!countOutput.success) {
          return {
            error:
              countOutput.error ||
              countOutput.message ||
              'Pick record action failed to count related records',
          };
        }

        relatedCounts.push(countOutput.result?.count ?? 0);
      }
    }

    let leastLoadedIndex = 0;

    for (let index = 1; index < relatedCounts.length; index++) {
      if (relatedCounts[index] < relatedCounts[leastLoadedIndex]) {
        leastLoadedIndex = index;
      }
    }

    return { index: leastLoadedIndex };
  }

  private async getPickedIndex({
    strategy,
    candidateCount,
    workspaceId,
    stepId,
  }: {
    strategy: WorkflowPickRecordStrategy;
    candidateCount: number;
    workspaceId: string;
    stepId: string;
  }): Promise<number> {
    if (strategy === 'ROUND_ROBIN') {
      const cursorKey = `pick-record:round-robin:${workspaceId}:${stepId}`;
      const nextCursor = await this.cacheStorageService.incrBy(cursorKey, 1);

      await this.cacheStorageService.expire(
        cursorKey,
        ROUND_ROBIN_CURSOR_TTL_MS,
      );

      return (nextCursor - 1) % candidateCount;
    }

    return Math.floor(Math.random() * candidateCount);
  }
}
