import { Injectable } from '@nestjs/common';

import { WorkflowActionType } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowActionExecutor } from 'src/modules/workflow/workflow-action-executor/workflow-action-executor.interface';
import { CodeWorkflowActionExecutor } from 'src/modules/workflow/workflow-action-executor/workflow-action-executors/code-workflow-action-executor';

@Injectable()
export class WorkflowActionExecutorFactory {
  constructor(
    private readonly codeWorkflowActionExecutor: CodeWorkflowActionExecutor,
  ) {}

  get(actionType: WorkflowActionType): WorkflowActionExecutor {
    switch (actionType) {
      case WorkflowActionType.CODE:
        return this.codeWorkflowActionExecutor;
      default:
        throw new Error(
          `Workflow action executor not found for action type '${actionType}'`,
        );
    }
  }
}
