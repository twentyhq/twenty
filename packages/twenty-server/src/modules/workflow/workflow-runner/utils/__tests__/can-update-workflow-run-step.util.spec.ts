import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
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

const WORKFLOW_RUN = {
  state: { flow: { steps: [FORM_STEP, RECORD_STEP] } },
};

describe('canUpdateWorkflowRunStep', () => {
  it('refuses replacing a record step with another action', () => {
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
        workflowRun: WORKFLOW_RUN,
        step: deleteStep,
      }),
    ).toBe(false);
  });

  it('lets the values of a form step be filled', () => {
    expect(
      canUpdateWorkflowRunStep({
        workflowRun: WORKFLOW_RUN,
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

  it('lets the values of a form step be filled when the stored step still carries a legacy retry flag', () => {
    const legacyFormStep = {
      ...FORM_STEP,
      settings: {
        ...FORM_STEP.settings,
        errorHandlingOptions: {
          ...ERROR_HANDLING_OPTIONS,
          retryOnFailure: { value: false },
        },
      },
    } as unknown as WorkflowFormAction;

    expect(
      canUpdateWorkflowRunStep({
        workflowRun: { state: { flow: { steps: [legacyFormStep] } } },
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

  it('refuses a change to the fields of a form step', () => {
    const textFieldTurnedIntoRecordPicker: WorkflowFormAction = {
      ...FORM_STEP,
      settings: {
        ...FORM_STEP.settings,
        input: [
          {
            ...FORM_STEP.settings.input[0],
            type: 'RECORD',
            settings: { objectName: 'opportunity' },
            value: { id: 'opportunity-id' },
          },
        ],
      },
    };

    expect(
      canUpdateWorkflowRunStep({
        workflowRun: WORKFLOW_RUN,
        step: textFieldTurnedIntoRecordPicker,
      }),
    ).toBe(false);
  });

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
  const renamedFormStep: WorkflowFormAction = {
    ...FORM_STEP,
    name: 'Renamed',
  };

  it.each<{ change: string; step: WorkflowAction }>([
    { change: 'a code step replacing the form', step: codeStepReplacingForm },
    {
      change: 'a form step taking over another step id',
      step: formStepReplacingRecord,
    },
    { change: 'a rerouted form step', step: reroutedFormStep },
    { change: 'a renamed form step', step: renamedFormStep },
  ])('refuses $change', ({ step }) => {
    expect(
      canUpdateWorkflowRunStep({
        workflowRun: WORKFLOW_RUN,
        step,
      }),
    ).toBe(false);
  });
});
