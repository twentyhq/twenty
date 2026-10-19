import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowVersionEdgeException } from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { addEdgeToWorkflowVersionContent } from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/add-edge-to-workflow-version-content.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: 0 },
};

const trigger: WorkflowTrigger = {
  name: 'Manual Trigger',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
  nextStepIds: [],
};

const iteratorStep = {
  id: 'iterator',
  name: 'Loop',
  type: WorkflowActionType.ITERATOR,
  valid: true,
  nextStepIds: [],
  settings: {
    input: { items: ['a', 'b'] },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

const bodyStep = {
  id: 'body',
  name: 'Body',
  type: WorkflowActionType.SEND_EMAIL,
  valid: true,
  nextStepIds: [],
  settings: {
    input: {
      connectedAccountId: '',
      recipients: { to: '', cc: '', bcc: '' },
      subject: '',
      body: '',
    },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

const steps = [iteratorStep, bodyStep];

describe('addEdgeToWorkflowVersionContent', () => {
  it('should connect the trigger to a step', () => {
    const result = addEdgeToWorkflowVersionContent({
      trigger,
      steps,
      source: TRIGGER_STEP_ID,
      target: 'iterator',
    });

    expect(result.hasChanged).toBe(true);
    expect(result.trigger?.nextStepIds).toEqual(['iterator']);
    expect(result.steps).toBe(steps);
  });

  it('should not change the content when the edge already exists', () => {
    const connectedTrigger = { ...trigger, nextStepIds: ['iterator'] };

    const result = addEdgeToWorkflowVersionContent({
      trigger: connectedTrigger,
      steps,
      source: TRIGGER_STEP_ID,
      target: 'iterator',
    });

    expect(result).toEqual({
      trigger: connectedTrigger,
      steps,
      hasChanged: false,
    });
  });

  it('should connect an iterator to its loop body', () => {
    const result = addEdgeToWorkflowVersionContent({
      trigger,
      steps,
      source: 'iterator',
      target: 'body',
      sourceConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: { isConnectedToLoop: true },
      },
    });

    const updatedIterator = result.steps?.find(
      (step) => step.id === 'iterator',
    );

    expect(result.hasChanged).toBe(true);
    expect(updatedIterator?.nextStepIds).toEqual([]);
    expect(
      (updatedIterator?.settings.input as { initialLoopStepIds?: string[] })
        .initialLoopStepIds,
    ).toEqual(['body']);
  });

  it('should connect a step to the next one', () => {
    const result = addEdgeToWorkflowVersionContent({
      trigger,
      steps,
      source: 'body',
      target: 'iterator',
    });

    expect(result.hasChanged).toBe(true);
    expect(
      result.steps?.find((step) => step.id === 'body')?.nextStepIds,
    ).toEqual(['iterator']);
  });

  it.each([
    { source: TRIGGER_STEP_ID, target: 'unknown' },
    { source: 'unknown', target: 'body' },
  ])('should throw when $source -> $target is dangling', (edge) => {
    expect(() =>
      addEdgeToWorkflowVersionContent({ trigger, steps, ...edge }),
    ).toThrow(WorkflowVersionEdgeException);
  });

  it('should throw when connecting from a missing trigger', () => {
    expect(() =>
      addEdgeToWorkflowVersionContent({
        trigger: null,
        steps,
        source: TRIGGER_STEP_ID,
        target: 'body',
      }),
    ).toThrow(WorkflowVersionEdgeException);
  });
});
