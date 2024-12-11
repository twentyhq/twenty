import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { WorkflowUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

@Injectable()
export class UpdateRecordWorkflowAction implements WorkflowAction {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async execute(
    workflowActionInput: WorkflowUpdateRecordActionInput,
  ): Promise<WorkflowActionResult> {
    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const objectRecord = await repository.findOne({
      where: {
        id: workflowActionInput.objectRecordId,
      },
    });

    if (!objectRecord) {
      throw new RecordCRUDActionException(
        `Failed to update: Record ${workflowActionInput.objectName} with id ${workflowActionInput.objectRecordId} not found`,
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    await repository.update(workflowActionInput.objectRecordId, {
      ...workflowActionInput.objectRecord,
    });

    return {
      result: {
        ...objectRecord,
        ...workflowActionInput.objectRecord,
      },
    };
  }
}
