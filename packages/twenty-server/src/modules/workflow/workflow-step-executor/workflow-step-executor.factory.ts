import { Injectable } from '@nestjs/common';

import { WorkflowStepType } from 'src/modules/workflow/common/types/workflow-step.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.exception';
import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.interface';
import { CodeActionExecutorFactory } from 'src/modules/workflow/workflow-step-executor/factories/code-action-executor.factory';
import { SendEmailActionExecutorFactory } from 'src/modules/workflow/workflow-step-executor/factories/send-email-action-executor.factory';

@Injectable()
export class WorkflowStepExecutorFactory {
  constructor(
    private readonly codeActionExecutor: CodeActionExecutorFactory,
    private readonly sendEmailActionExecutor: SendEmailActionExecutorFactory,
  ) {}

  get(stepType: WorkflowStepType): WorkflowStepExecutor {
    switch (stepType) {
      case WorkflowStepType.CODE_ACTION:
        return this.codeActionExecutor;
      case WorkflowStepType.SEND_EMAIL_ACTION:
        return this.sendEmailActionExecutor;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
