import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowCodeAction,
  type WorkflowCreateRecordAction,
  type WorkflowDeleteRecordAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canUpdateWorkflowRunStep } from 'src/modules/workflow/workflow-runner/utils/can-update-workflow-run-step.util';

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: 0 },
  continueOnFailure: { value: false },
};

const FORM_STEP: WorkflowFormAction = {
  id: 'form-step',
  name: 'Ask',
  type: WorkflowActionType.FORM,
  valid: true,
  nextStepIds: ['record-step'],
  settings: {
    input: [
      {
        id: 'field',
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
    ],
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
};

const RECORD_STEP: WorkflowCreateRecordAction = {
  id: 'record-step',
  name: 'Create company',
  type: WorkflowActionType.CREATE_RECORD,
  valid: true,
  nextStepIds: [],
  settings: {
    input: { objectName: 'company', objectRecord: {} },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
};

const buildWorkflowRun = (applicationId?: string) => ({
  createdBy: { context: { applicationId } },
  state: { flow: { steps: [FORM_STEP, RECORD_STEP] } },
});

describe('canUpdateWorkflowRunStep', () => {
  it('keeps the steps of a run no application bounds editable', () => {
    const deleteStep: WorkflowDeleteRecordAction = {
      ...RECORD_STEP,
      type: WorkflowActionType.DELETE_RECORD,
      settings: {
        ...RECORD_STEP.settings,
        input: { objectName: 'company', objectRecordId: 'company-id' },
      },
    };

    expect(
      canUpdateWorkflowRunStep({
        workflowRun: buildWorkflowRun(),
        step: deleteStep,
      }),
    ).toBe(true);
  });

  it('lets the values of a form step of an application-bound run be filled', () => {
    expect(
      canUpdateWorkflowRunStep({
        workflowRun: buildWorkflowRun('installed-app-id'),
        step: {
          ...FORM_STEP,
          settings: {
            ...FORM_STEP.settings,
            input: [{ ...FORM_STEP.settings.input[0], value: 'Acme' }],
          },
        },
      }),
    ).toBe(true);
  });

  it('refuses any other change to the steps of an application-bound run', () => {
    const codeStepReplacingForm: WorkflowCodeAction = {
      ...FORM_STEP,
      type: WorkflowActionType.CODE,
      settings: {
        ...FORM_STEP.settings,
        input: { logicFunctionId: 'function-id', logicFunctionInput: {} },
      },
    };
    const formStepReplacingRecord: WorkflowFormAction = {
      ...FORM_STEP,
      id: RECORD_STEP.id,
    };
    const reroutedFormStep: WorkflowFormAction = {
      ...FORM_STEP,
      nextStepIds: [],
    };

    for (const step of [
      codeStepReplacingForm,
      formStepReplacingRecord,
      reroutedFormStep,
    ]) {
      expect(
        canUpdateWorkflowRunStep({
          workflowRun: buildWorkflowRun('installed-app-id'),
          step,
        }),
      ).toBe(false);
    }
  });
});
