import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { AiAgentWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent.workflow-action';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { DelayWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay.workflow-action';
import { EmptyWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/empty/empty.workflow-action';
import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';
import { FormWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/form.workflow-action';
import { HttpRequestWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/http-request.workflow-action';
import { IfElseWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/if-else.workflow-action';
import { IteratorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/iterator.workflow-action';
import { LogicFunctionWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/logic-function.workflow-action';
import { DraftEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/draft-email.workflow-action';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { CreateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-record.workflow-action';
import { DeleteRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/delete-record.workflow-action';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { PickRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/pick-record.workflow-action';
import { UpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/update-record.workflow-action';
import { UpsertRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/upsert-record.workflow-action';
import { WorkflowActionType } from 'twenty-shared/workflow';

@Injectable()
export class WorkflowActionFactory {
  constructor(
    private readonly codeWorkflowAction: CodeWorkflowAction,
    private readonly logicFunctionWorkflowAction: LogicFunctionWorkflowAction,
    private readonly createRecordWorkflowAction: CreateRecordWorkflowAction,
    private readonly upsertRecordWorkflowAction: UpsertRecordWorkflowAction,
    private readonly updateRecordWorkflowAction: UpdateRecordWorkflowAction,
    private readonly deleteRecordWorkflowAction: DeleteRecordWorkflowAction,
    private readonly findRecordsWorkflowAction: FindRecordsWorkflowAction,
    private readonly pickRecordWorkflowAction: PickRecordWorkflowAction,
    private readonly formWorkflowAction: FormWorkflowAction,
    private readonly filterWorkflowAction: FilterWorkflowAction,
    private readonly ifElseWorkflowAction: IfElseWorkflowAction,
    private readonly iteratorWorkflowAction: IteratorWorkflowAction,
    private readonly httpRequestWorkflowAction: HttpRequestWorkflowAction,
    private readonly sendEmailWorkflowAction: SendEmailWorkflowAction,
    private readonly draftEmailWorkflowAction: DraftEmailWorkflowAction,
    private readonly aiAgentWorkflowAction: AiAgentWorkflowAction,
    private readonly emptyWorkflowAction: EmptyWorkflowAction,
    private readonly delayWorkflowAction: DelayWorkflowAction,
  ) {}

  get(stepType: WorkflowActionType): WorkflowAction {
    switch (stepType) {
      case WorkflowActionType.CODE:
        return this.codeWorkflowAction;
      case WorkflowActionType.LOGIC_FUNCTION:
        return this.logicFunctionWorkflowAction;
      case WorkflowActionType.SEND_EMAIL:
        return this.sendEmailWorkflowAction;
      case WorkflowActionType.DRAFT_EMAIL:
        return this.draftEmailWorkflowAction;
      case WorkflowActionType.CREATE_RECORD:
        return this.createRecordWorkflowAction;
      case WorkflowActionType.UPSERT_RECORD:
        return this.upsertRecordWorkflowAction;
      case WorkflowActionType.UPDATE_RECORD:
        return this.updateRecordWorkflowAction;
      case WorkflowActionType.DELETE_RECORD:
        return this.deleteRecordWorkflowAction;
      case WorkflowActionType.FIND_RECORDS:
        return this.findRecordsWorkflowAction;
      case WorkflowActionType.PICK_RECORD:
        return this.pickRecordWorkflowAction;
      case WorkflowActionType.FORM:
        return this.formWorkflowAction;
      case WorkflowActionType.FILTER:
        return this.filterWorkflowAction;
      case WorkflowActionType.IF_ELSE:
        return this.ifElseWorkflowAction;
      case WorkflowActionType.ITERATOR:
        return this.iteratorWorkflowAction;
      case WorkflowActionType.HTTP_REQUEST:
        return this.httpRequestWorkflowAction;
      case WorkflowActionType.AI_AGENT:
        return this.aiAgentWorkflowAction;
      case WorkflowActionType.EMPTY:
        return this.emptyWorkflowAction;
      case WorkflowActionType.DELAY:
        return this.delayWorkflowAction;
      default:
        throw new WorkflowStepExecutorException(
          `Workflow step executor not found for step type '${stepType}'`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
    }
  }
}
