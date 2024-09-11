import { Injectable } from '@nestjs/common';

import { WorkflowStepType } from 'src/modules/workflow/common/types/workflow-step.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.exception';
import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.interface';
import { CodeWorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/factories/code.workflow-step-executor';
import { SendEmailWorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/factories/send-email.workflow-step-executor';

@Injectable()
export class WorkflowStepExecutorFactory {
  constructor(
    private readonly codeWorkflowStepExecutor: CodeWorkflowStepExecutor,
    private readonly sendEmailWorkflowStepExecutor: SendEmailWorkflowStepExecutor,
  ) {}

  get(stepType: WorkflowStepType): WorkflowStepExecutor {
    switch (stepType) {
      case WorkflowStepType.CODE_ACTION:
        return this.codeWorkflowStepExecutor;
      case WorkflowStepType.SEND_EMAIL_ACTION:
        return this.sendEmailWorkflowStepExecutor;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
