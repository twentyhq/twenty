import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowCreateRecordActionInput,
  WorkflowRecordCRUDActionInput,
  WorkflowRecordCRUDType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class RecordCRUDWorkflowAction implements WorkflowAction {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async execute(
    workflowActionInput: WorkflowRecordCRUDActionInput,
  ): Promise<WorkflowActionResult> {
    switch (workflowActionInput.type) {
      case WorkflowRecordCRUDType.CREATE:
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
