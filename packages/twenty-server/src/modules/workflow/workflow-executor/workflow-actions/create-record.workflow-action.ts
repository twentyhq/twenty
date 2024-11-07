import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';

type ObjectRecord = Record<string, any>;

export type WorkflowCreateRecordStepInput = {
  objectName: string;
  objectRecord: ObjectRecord;
};

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowAction {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async execute(
    workflowStepInput: WorkflowCreateRecordStepInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowStepInput.objectName,
    );

    const objectRecord = await repository.create(
      workflowStepInput.objectRecord,
    );

    const createdObjectRecord = await repository.save(objectRecord);

    return { result: createdObjectRecord };
  }
}
