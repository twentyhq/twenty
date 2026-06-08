import { Injectable } from '@nestjs/common';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { EmailWorkflowActionBase } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/email-workflow-action.base';
import { isWorkflowDraftEmailAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/guards/is-workflow-draft-email-action.guard';
import { type EmailStepLogMode } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class DraftEmailWorkflowAction extends EmailWorkflowActionBase {
  constructor(
    private readonly draftEmailTool: DraftEmailTool,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    super(DraftEmailWorkflowAction.name, workflowRunStepLogService);
  }

  protected getTool(): Tool {
    return this.draftEmailTool;
  }

  protected getMode(): EmailStepLogMode {
    return 'DRAFT';
  }

  protected assertStep(step: WorkflowAction): void {
    if (!isWorkflowDraftEmailAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a draft-email action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }
  }
}
