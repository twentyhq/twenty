import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';

import { findApplicationWorkflowUpdateConflicts } from 'src/modules/workflow/application-workflow-lifecycle/utils/find-application-workflow-update-conflicts.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const greetStep = {
  id: 'greet',
  name: 'Greet',
  type: WorkflowActionType.LOGIC_FUNCTION,
  valid: true,
  nextStepIds: ['wait'],
  settings: {
    input: { logicFunctionId: 'greet-id', logicFunctionInput: {} },
    outputSchema: {},
    errorHandlingOptions: {},
  },
} as unknown as WorkflowAction;

const waitStep = {
  id: 'wait',
  name: 'Wait',
  type: WorkflowActionType.DELAY,
  valid: true,
  nextStepIds: [],
  settings: { input: {}, outputSchema: {}, errorHandlingOptions: {} },
} as unknown as WorkflowAction;

const buildRun = (
  coreWorkflowId: string,
  stepStatuses: Record<string, StepStatus>,
): Pick<WorkflowRunWorkspaceEntity, 'coreWorkflowId' | 'state'> => ({
  coreWorkflowId,
  state: {
    flow: {
      trigger: {} as WorkflowRunWorkspaceEntity['state']['flow']['trigger'],
      steps: [greetStep, waitStep],
    },
    stepInfos: Object.fromEntries(
      Object.entries(stepStatuses).map(([stepId, status]) => [
        stepId,
        { status },
      ]),
    ),
  },
});

const noChanges = {
  removedWorkflowIds: new Set<string>(),
  changedLogicFunctionDescriptionById: new Map<string, string>(),
  changedAgentDescriptionById: new Map<string, string>(),
};

const greetChanged = {
  ...noChanges,
  changedLogicFunctionDescriptionById: new Map([
    ['greet-id', 'logic function "greet", which this update changes'],
  ]),
};

describe('findApplicationWorkflowUpdateConflicts', () => {
  it('blocks a change to a function that a run has not executed yet', () => {
    expect(
      findApplicationWorkflowUpdateConflicts({
        inProgressWorkflowRuns: [
          buildRun('workflow-id', {
            greet: StepStatus.NOT_STARTED,
            wait: StepStatus.NOT_STARTED,
          }),
          buildRun('workflow-id', {
            greet: StepStatus.PENDING,
            wait: StepStatus.NOT_STARTED,
          }),
        ],
        workflowNameById: { 'workflow-id': 'Greeting' },
        changedDependencies: greetChanged,
      }),
    ).toEqual([
      {
        workflowName: 'Greeting',
        workflowRunCount: 2,
        blockedChanges: ['logic function "greet", which this update changes'],
      },
    ]);
  });

  it('allows a change to a function that the run already executed', () => {
    expect(
      findApplicationWorkflowUpdateConflicts({
        inProgressWorkflowRuns: [
          buildRun('workflow-id', {
            greet: StepStatus.SUCCESS,
            wait: StepStatus.PENDING,
          }),
        ],
        workflowNameById: { 'workflow-id': 'Greeting' },
        changedDependencies: greetChanged,
      }),
    ).toEqual([]);
  });

  it('blocks removing a workflow that still has runs in progress', () => {
    expect(
      findApplicationWorkflowUpdateConflicts({
        inProgressWorkflowRuns: [
          buildRun('workflow-id', {
            greet: StepStatus.SUCCESS,
            wait: StepStatus.PENDING,
          }),
        ],
        workflowNameById: { 'workflow-id': 'Greeting' },
        changedDependencies: {
          ...noChanges,
          removedWorkflowIds: new Set(['workflow-id']),
        },
      }),
    ).toEqual([
      {
        workflowName: 'Greeting',
        workflowRunCount: 1,
        blockedChanges: ['the workflow, which this update removes'],
      },
    ]);
  });

  it('ignores runs that do not use a changed dependency', () => {
    expect(
      findApplicationWorkflowUpdateConflicts({
        inProgressWorkflowRuns: [
          buildRun('workflow-id', {
            greet: StepStatus.NOT_STARTED,
            wait: StepStatus.NOT_STARTED,
          }),
        ],
        workflowNameById: { 'workflow-id': 'Greeting' },
        changedDependencies: noChanges,
      }),
    ).toEqual([]);
  });
});
