import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { applyWorkflowStepPositions } from 'src/modules/workflow/workflow-builder/utils/apply-workflow-step-positions.util';

const trigger = { position: { x: 1, y: 2 } };

const steps = [
  { id: 'first', position: { x: 3, y: 4 } },
  { id: 'second', position: { x: 5, y: 6 } },
];

describe('applyWorkflowStepPositions', () => {
  it('should write the given positions and leave the other nodes untouched', () => {
    const content = applyWorkflowStepPositions({
      trigger,
      steps,
      positions: [{ id: 'second', position: { x: 7, y: 8 } }],
    });

    expect(content.trigger?.position).toEqual({ x: 1, y: 2 });
    expect(content.steps?.map((step) => step.position)).toEqual([
      { x: 3, y: 4 },
      { x: 7, y: 8 },
    ]);
  });

  it('should remove a position given as null', () => {
    const content = applyWorkflowStepPositions({
      trigger,
      steps,
      positions: [
        { id: TRIGGER_STEP_ID, position: null },
        { id: 'first', position: null },
      ],
    });

    expect(content.trigger?.position).toBeUndefined();
    expect(content.steps?.map((step) => step.position)).toEqual([
      undefined,
      { x: 5, y: 6 },
    ]);
  });
});
