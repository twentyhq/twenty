import { Injectable } from '@nestjs/common';

import { WorkflowStepType } from 'src/modules/workflow/common/types/workflow-step.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.exception';
import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.interface';
import { CodeActionExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executors/code-action-executor';

@Injectable()
export class WorkflowStepExecutorFactory {
  constructor(private readonly codeActionExecutor: CodeActionExecutor) {}

  get(stepType: WorkflowStepType): WorkflowStepExecutor {
    switch (stepType) {
      case WorkflowStepType.CODE_ACTION:
        return this.codeActionExecutor;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
