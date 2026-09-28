/** @jest-environment node */

import {
  workflowManifestSchema,
  type WorkflowManifest,
} from '../workflowManifestType';

const iteratorId = '44444444-4444-4444-8444-444444444444';
const delayId = '55555555-5555-4555-8555-555555555555';
const finishId = '66666666-6666-4666-8666-666666666666';
const workflow: WorkflowManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'Iterator validation',
  version: {
    universalIdentifier: '22222222-2222-4222-8222-222222222222',
    trigger: {
      universalIdentifier: '33333333-3333-4333-8333-333333333333',
      type: 'MANUAL',
      nextStepIds: [iteratorId],
    },
    steps: [
      {
        universalIdentifier: iteratorId,
        name: 'Loop',
        type: 'ITERATOR',
        input: { items: ['one', 'two'], initialLoopStepIds: [delayId] },
        nextStepIds: [finishId],
      },
      {
        universalIdentifier: delayId,
        name: 'Delay',
        type: 'DELAY',
        input: { delayType: 'DURATION', duration: { seconds: 1 } },
        nextStepIds: [iteratorId],
      },
      {
        universalIdentifier: finishId,
        name: 'Finish',
        type: 'EMPTY',
        input: {},
        nextStepIds: [],
      },
    ],
  },
};

describe('workflow manifest iterator cycles', () => {
  it('accepts a loop body returning to its iterator', () => {
    expect(workflowManifestSchema.safeParse(workflow).success).toBe(true);
  });

  it('rejects ordinary cycles inside a loop body', () => {
    const invalid = structuredClone(workflow);
    invalid.version.steps[1].nextStepIds = [delayId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects returning to an iterator from its completed branch', () => {
    const invalid = structuredClone(workflow);
    invalid.version.steps[2].nextStepIds = [iteratorId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects an iterator pointing to itself as its loop body', () => {
    const invalid = structuredClone(workflow);
    const iterator = invalid.version.steps[0];
    if (iterator.type !== 'ITERATOR') throw new Error('Expected iterator');
    iterator.input.initialLoopStepIds = [iteratorId, delayId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });
});
