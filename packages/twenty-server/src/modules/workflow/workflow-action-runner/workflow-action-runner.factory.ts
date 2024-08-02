import { Injectable } from '@nestjs/common';

import { CodeWorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runners/code-workflow-action-runner';
import { WorkflowActionType } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.interface';

@Injectable()
export class WorkflowActionRunnerFactory {
  constructor(
    private readonly codeWorkflowActionRunner: CodeWorkflowActionRunner,
  ) {}

  get(actionType: WorkflowActionType): WorkflowActionRunner {
    switch (actionType) {
      case WorkflowActionType.CODE:
        return this.codeWorkflowActionRunner;
      default:
        throw new Error(
          `Workflow action executor not found for action type '${actionType}'`,
        );
    }
  }
}
