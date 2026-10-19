import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowVersionEdgeException } from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { assembleWorkflowVersionContent } from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
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
  position: { x: 999, y: 999 },
};

const buildSendEmailStep = (id: string) =>
  ({
    id,
    name: id,
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
  }) as WorkflowAction;

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

const steps = [
  iteratorStep,
  buildSendEmailStep('inside-loop'),
  buildSendEmailStep('after-loop'),
];

describe('assembleWorkflowVersionContent', () => {
  it('should wire the loop body and the step after the loop', () => {
    const content = assembleWorkflowVersionContent({
      trigger,
      steps,
      edges: [
        { source: TRIGGER_STEP_ID, target: 'iterator' },
        {
          source: 'iterator',
          target: 'inside-loop',
          sourceConnectionOptions: {
            connectedStepType: WorkflowActionType.ITERATOR,
            settings: { isConnectedToLoop: true },
          },
        },
        { source: 'inside-loop', target: 'iterator' },
        { source: 'iterator', target: 'after-loop' },
      ],
    });

    const stepById = new Map(content.steps?.map((step) => [step.id, step]));

    expect(content.trigger?.nextStepIds).toEqual(['iterator']);
    expect(stepById.get('iterator')?.nextStepIds).toEqual(['after-loop']);
    expect(
      (
        stepById.get('iterator')?.settings.input as {
          initialLoopStepIds?: string[];
        }
      ).initialLoopStepIds,
    ).toEqual(['inside-loop']);
    expect(stepById.get('inside-loop')?.nextStepIds).toEqual(['iterator']);
  });

  it('should lay out every node instead of keeping the given positions', () => {
    const content = assembleWorkflowVersionContent({
      trigger,
      steps,
      edges: [{ source: TRIGGER_STEP_ID, target: 'iterator' }],
    });

    expect(content.trigger?.position).not.toEqual(trigger.position);
    content.steps?.forEach((step) => {
      expect(step.position).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
      });
    });
  });

  it('should throw on an edge to an unknown step', () => {
    expect(() =>
      assembleWorkflowVersionContent({
        trigger,
        steps,
        edges: [{ source: TRIGGER_STEP_ID, target: 'unknown' }],
      }),
    ).toThrow(WorkflowVersionEdgeException);
  });
});
