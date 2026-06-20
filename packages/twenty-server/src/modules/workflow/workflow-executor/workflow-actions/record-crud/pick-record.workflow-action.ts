import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

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
import { type WorkflowPickRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-pick-record-action-input.type';

@Injectable()
export class PickRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
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

    const { objectName, recordIds } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowPickRecordActionInput;

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

    const pickedRecord =
      candidateRecords[Math.floor(Math.random() * candidateRecords.length)];

    return { result: pickedRecord };
  }
}
