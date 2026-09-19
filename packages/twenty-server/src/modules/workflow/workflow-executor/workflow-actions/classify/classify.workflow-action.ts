import { Injectable } from '@nestjs/common';
import { resolveInput } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { AiClassificationService } from 'src/engine/metadata-modules/ai/ai-classification/ai-classification.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';

@Injectable()
export class ClassifyWorkflowAction implements WorkflowAction {
  constructor(
    private readonly classificationService: AiClassificationService,
    private readonly executionContextService: WorkflowExecutionContextService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (step.type !== WorkflowActionType.CLASSIFY) {
      throw new WorkflowStepExecutorException(
        'Step is not a classification action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const executionContext =
      await this.executionContextService.getExecutionContext(runInfo);
    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;
    const result = await this.classificationService.classify(
      {
        ...step.settings.input,
        text: resolveInput(step.settings.input.text, context),
      },
      runInfo.workspaceId,
      userWorkspaceId,
    );

    return { result };
  }
}
