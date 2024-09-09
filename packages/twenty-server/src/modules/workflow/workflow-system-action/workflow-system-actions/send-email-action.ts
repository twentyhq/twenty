import { Injectable } from '@nestjs/common';

import { WorkflowSystemAction } from 'src/modules/workflow/workflow-system-action/workflow-system-action.interface';
import { WorkflowStep } from 'src/modules/workflow/common/types/workflow-step.type';
import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';

@Injectable()
export class SendEmailAction implements WorkflowSystemAction {
  async execute({
    step,
    payload,
  }: {
    step: WorkflowStep;
    payload?: object;
  }): Promise<WorkflowStepResult> {
    return {
      data: {
        step,
        payload,
      },
    };
  }
}
