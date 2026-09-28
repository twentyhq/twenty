import { FieldActorSource } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canMemberChangeWorkflowRun } from 'src/modules/workflow/workflow-runner/utils/can-member-change-workflow-run.util';

const INITIATOR_MEMBER_ID = 'initiator-member-id';
const OTHER_MEMBER_ID = 'other-member-id';
const OWNING_APPLICATION = { id: 'installed-app-id' };

const FORM_STEP = {
  id: 'form-step',
  type: WorkflowActionType.FORM,
  name: 'Ask',
  valid: true,
  nextStepIds: ['record-step'],
  settings: {
    input: [{ id: 'field', label: 'Name', type: 'TEXT', value: null }],
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
} as unknown as WorkflowAction;

const RECORD_STEP = {
  ...FORM_STEP,
  id: 'record-step',
  type: WorkflowActionType.CREATE_RECORD,
  nextStepIds: [],
} as unknown as WorkflowAction;

const workflowRun = {
  createdBy: {
    source: FieldActorSource.MANUAL,
    workspaceMemberId: INITIATOR_MEMBER_ID,
    name: 'Tim Apple',
    context: {},
  },
  state: {
    flow: {
      steps: [FORM_STEP, RECORD_STEP],
    },
  },
} as unknown as Pick<WorkflowRunWorkspaceEntity, 'createdBy' | 'state'>;

describe('canMemberChangeWorkflowRun', () => {
  it('keeps workspace workflow runs open to any member allowed on workflows', () => {
    expect(
      canMemberChangeWorkflowRun({
        workflowRun,
        owningApplication: null,
        workspaceMemberId: OTHER_MEMBER_ID,
        replacementStep: {
          ...RECORD_STEP,
          type: WorkflowActionType.DELETE_RECORD,
        } as unknown as WorkflowAction,
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
            input: [{ id: 'field', label: 'Name', type: 'TEXT', value: 'A' }],
          },
        } as unknown as WorkflowAction,
      }),
    ).toBe(true);
  });

  it('refuses any other change to the graph of an application workflow run', () => {
    const replacements = [
      { ...RECORD_STEP, type: WorkflowActionType.FORM },
      { ...FORM_STEP, type: WorkflowActionType.CODE },
      { ...FORM_STEP, nextStepIds: [] },
    ] as unknown as WorkflowAction[];

    for (const replacementStep of replacements) {
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
