import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { SendEmailWorkflowAction } from 'src/modules/mail-sender/workflow-actions/send-email.workflow-action';
import { CodeWorkflowAction } from 'src/modules/serverless/workflow-actions/code.workflow-action';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record.workflow-action';

@Injectable()
export class WorkflowActionFactory {
  constructor(
    private readonly codeWorkflowAction: CodeWorkflowAction,
    private readonly sendEmailWorkflowAction: SendEmailWorkflowAction,
    private readonly createRecordWorkflowAction: CreateRecordWorkflowAction,
  ) {}

  get(stepType: WorkflowActionType): WorkflowAction {
    switch (stepType) {
      case WorkflowActionType.CODE:
        return this.codeWorkflowAction;
      case WorkflowActionType.SEND_EMAIL:
        return this.sendEmailWorkflowAction;
      case WorkflowActionType.CREATE_RECORD:
        return this.createRecordWorkflowAction;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
