import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowCreateRecordActionInput,
  WorkflowRecordOperationActionInput,
  WorkflowRecordOperationType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-operation/types/workflow-record-operation-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class RecordOperationWorkflowAction implements WorkflowAction {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async execute(
    workflowActionInput: WorkflowRecordOperationActionInput,
  ): Promise<WorkflowActionResult> {
    switch (workflowActionInput.type) {
      case WorkflowRecordOperationType.CREATE:
        return this.createRecord(workflowActionInput);
      default:
        throw new Error(
          `Unknown record operation type: ${workflowActionInput.type}`,
        );
    }
  }

  private async createRecord(
    workflowActionInput: WorkflowCreateRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const objectRecord = await repository.create(
      workflowActionInput.objectRecord,
    );

    const createdObjectRecord = await repository.save(objectRecord);

    return { result: createdObjectRecord };
  }
}
