import { Injectable } from '@nestjs/common';

import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.interface';
import { WorkflowSystemStep } from 'src/modules/workflow/common/types/workflow-step.type';
import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';
import { WorkflowSystemActionFactory } from 'src/modules/workflow/workflow-system-action/workflow-system-action.factory';

@Injectable()
export class SystemActionExecutor implements WorkflowStepExecutor {
  constructor(
    private readonly workflowSystemActionFactory: WorkflowSystemActionFactory,
  ) {}

  async execute({
    step,
    payload,
  }: {
    step: WorkflowSystemStep;
    payload?: object;
  }): Promise<WorkflowStepResult> {
    try {
      const workflowSystemAction = this.workflowSystemActionFactory.get(
        step.settings.systemActionType,
      );

      return await workflowSystemAction.execute({ step, payload });
    } catch (error) {
      return { error };
    }
  }
}
