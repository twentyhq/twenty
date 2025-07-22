import { Injectable } from '@nestjs/common';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { AiAgentWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent.workflow-action';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';
import { FormWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form.workflow-action';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';
import { ToolExecutorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-executor-workflow-action';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowActionFactory {
  constructor(
    private readonly codeWorkflowAction: CodeWorkflowAction,
    private readonly createRecordWorkflowAction: CreateRecordWorkflowAction,
    private readonly updateRecordWorkflowAction: UpdateRecordWorkflowAction,
    private readonly deleteRecordWorkflowAction: DeleteRecordWorkflowAction,
    private readonly findRecordsWorkflowAction: FindRecordsWorkflowAction,
    private readonly formWorkflowAction: FormWorkflowAction,
    private readonly filterWorkflowAction: FilterWorkflowAction,
    private readonly toolExecutorWorkflowAction: ToolExecutorWorkflowAction,
    private readonly aiAgentWorkflowAction: AiAgentWorkflowAction,
  ) {}

  get(stepType: WorkflowActionType): WorkflowAction {
    switch (stepType) {
      case WorkflowActionType.CODE:
        return this.codeWorkflowAction;
      case WorkflowActionType.SEND_EMAIL:
        return this.toolExecutorWorkflowAction;
      case WorkflowActionType.CREATE_RECORD:
        return this.createRecordWorkflowAction;
      case WorkflowActionType.UPDATE_RECORD:
        return this.updateRecordWorkflowAction;
      case WorkflowActionType.DELETE_RECORD:
        return this.deleteRecordWorkflowAction;
      case WorkflowActionType.FIND_RECORDS:
        return this.findRecordsWorkflowAction;
      case WorkflowActionType.FORM:
        return this.formWorkflowAction;
      case WorkflowActionType.FILTER:
        return this.filterWorkflowAction;
      case WorkflowActionType.HTTP_REQUEST:
        return this.toolExecutorWorkflowAction;
      case WorkflowActionType.AI_AGENT:
        return this.aiAgentWorkflowAction;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
