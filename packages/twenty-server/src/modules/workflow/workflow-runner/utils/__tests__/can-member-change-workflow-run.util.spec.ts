import { FieldMetadataType } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowCodeAction,
  type WorkflowCreateRecordAction,
  type WorkflowDeleteRecordAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canMemberChangeWorkflowRun } from 'src/modules/workflow/workflow-runner/utils/can-member-change-workflow-run.util';

const INITIATOR_MEMBER_ID = 'initiator-member-id';
const OTHER_MEMBER_ID = 'other-member-id';
const OWNING_APPLICATION = { id: 'installed-app-id' };

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

const workflowRun = {
  createdBy: { workspaceMemberId: INITIATOR_MEMBER_ID },
  state: { flow: { steps: [FORM_STEP, RECORD_STEP] } },
};

describe('canMemberChangeWorkflowRun', () => {
  it('keeps workspace workflow runs open to any member allowed on workflows', () => {
    const deleteStep: WorkflowDeleteRecordAction = {
      ...RECORD_STEP,
      type: WorkflowActionType.DELETE_RECORD,
      settings: {
        ...RECORD_STEP.settings,
        input: { objectName: 'company', objectRecordId: 'company-id' },
      },
    };

    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: null,
        workspaceMemberId: OTHER_MEMBER_ID,
        replacementStep: deleteStep,
      }),
    ).toBe(true);
  });

  it('lets the member who started an application workflow run continue it', () => {
    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: OWNING_APPLICATION,
        workspaceMemberId: INITIATOR_MEMBER_ID,
      }),
    ).toBe(true);
  });

  it('refuses another member or a request without a member on an application workflow run', () => {
    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: OWNING_APPLICATION,
        workspaceMemberId: OTHER_MEMBER_ID,
      }),
    ).toBe(false);
    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: OWNING_APPLICATION,
        workspaceMemberId: undefined,
      }),
    ).toBe(false);
  });

  it('lets the initiator fill the values of a pending form step', () => {
    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: OWNING_APPLICATION,
        workspaceMemberId: INITIATOR_MEMBER_ID,
        replacementStep: {
          ...FORM_STEP,
          settings: {
            ...FORM_STEP.settings,
            input: [{ ...FORM_STEP.settings.input[0], value: 'Acme' }],
          },
        },
      }),
    ).toBe(true);
  });

  it('refuses any other change to the graph of an application workflow run', () => {
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

    for (const replacementStep of [
      codeStepReplacingForm,
      formStepReplacingRecord,
      reroutedFormStep,
    ]) {
      expect(
        canMemberChangeWorkflowRun({
          workflowRun,
          owningApplication: OWNING_APPLICATION,
          workspaceMemberId: INITIATOR_MEMBER_ID,
          replacementStep,
        }),
      ).toBe(false);
    }
  });
});
