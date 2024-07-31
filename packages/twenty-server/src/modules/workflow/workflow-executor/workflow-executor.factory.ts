import { Injectable } from '@nestjs/common';

import { CodeExecutor } from 'src/modules/workflow/workflow-executor/executors/code.executor';
import { WorkflowActionType } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/workflow-executor.interface';

@Injectable()
export class WorkflowExecutorFactory {
  constructor(private readonly codeExecutor: CodeExecutor) {}

  get(actionType: WorkflowActionType): WorkflowExecutor {
    switch (actionType) {
      case WorkflowActionType.CODE:
        return this.codeExecutor;
      default:
        throw new Error(
          `Workflow action executor not found for action type '${actionType}'`,
        );
    }
  }
}
