import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { StepFilterVariableSourcesWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/step-filter-variable-sources.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

@Injectable()
export class FilterWorkflowAction implements WorkflowAction {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly stepFilterVariableSourcesWorkspaceService: StepFilterVariableSourcesWorkspaceService,
  ) {}

  async execute(input: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const { currentStepId, trigger, steps, context, runInfo } = input;

    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowFilterAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a filter action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { stepFilterGroups, stepFilters } = step.settings.input;

    if (!stepFilterGroups || !stepFilters) {
      return {
        result: {
          shouldEndWorkflowRun: false,
        },
      };
    }

    const { flatFieldMetadataMaps } =
      await this.workflowMetadataReadService.getFlatEntityMaps(
        runInfo.workspaceId,
      );

    const matchesFilter = evaluateStepFilters({
      stepFilters,
      stepFilterGroups,
      context,
      flatFieldMetadataMaps,
      variableSources:
        await this.stepFilterVariableSourcesWorkspaceService.buildVariableSources(
          { stepFilters, trigger, steps, workspaceId: runInfo.workspaceId },
        ),
    });

    return {
      result: {
        matchesFilter,
      },
      shouldEndWorkflowRun: !matchesFilter,
    };
  }
}
