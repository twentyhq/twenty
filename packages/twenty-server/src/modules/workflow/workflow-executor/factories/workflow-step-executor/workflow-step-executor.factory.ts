import { Injectable } from '@nestjs/common';

import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-step-executor.interface';

import { WorkflowStepType } from 'src/modules/workflow/workflow-executor/types/workflow-step.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { CodeWorkflowStepExecutor } from 'src/modules/workflow/workflow-executor/factories/workflow-step-executor/workflow-step-executors/code.workflow-step-executor';
import { SendEmailWorkflowStepExecutor } from 'src/modules/workflow/workflow-executor/factories/workflow-step-executor/workflow-step-executors/send-email.workflow-step-executor';

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
