import { Injectable } from '@nestjs/common';

import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { EmailWorkflowActionBase } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/email-workflow-action.base';
import { isWorkflowSendEmailAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/guards/is-workflow-send-email-action.guard';
import { type EmailStepLogMode } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class SendEmailWorkflowAction extends EmailWorkflowActionBase {
  constructor(
    private readonly sendEmailTool: SendEmailTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    super(SendEmailWorkflowAction.name, workflowRunStepLogService);
  }

  protected getTool(): Tool {
    return this.sendEmailTool;
  }

  protected getMode(): EmailStepLogMode {
    return 'SEND';
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowSendEmailAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send-email action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }
}
