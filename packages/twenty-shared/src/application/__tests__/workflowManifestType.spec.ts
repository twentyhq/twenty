/** @jest-environment node */

import { isDefined } from '@/utils/validation/isDefined';

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

const getStep = (definition: WorkflowManifest, index: number) => {
  const step = definition.version.steps[index];
  if (!isDefined(step)) {
    throw new Error(`Missing fixture step ${index}`);
  }
  return step;
};

describe('workflow manifest iterator cycles', () => {
  it('rejects a loop body without a return edge', () => {
    const invalid = structuredClone(workflow);
    getStep(invalid, 1).nextStepIds = [];
    const result = workflowManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('must return to iterator');
    }
  });

  it('requires nested iterators to return to their enclosing iterator after completion', () => {
    const nested = structuredClone(workflow);
    const innerId = '77777777-7777-4777-8777-777777777777';
    const outer = getStep(nested, 0);
    if (outer.type !== 'ITERATOR') {
      throw new Error('Expected iterator');
    }
    outer.input.initialLoopStepIds = [innerId];
    getStep(nested, 1).nextStepIds = [innerId];
    nested.version.steps.push({
      universalIdentifier: innerId,
      name: 'Inner loop',
      type: 'ITERATOR',
      input: { items: ['inner'], initialLoopStepIds: [delayId] },
      nextStepIds: [],
    });
    expect(workflowManifestSchema.safeParse(nested).success).toBe(false);
    getStep(nested, 3).nextStepIds = [iteratorId];
    expect(workflowManifestSchema.safeParse(nested).success).toBe(true);
  });

  it('rejects references to a missing step', () => {
    const invalid = structuredClone(workflow);
    const iterator = getStep(invalid, 0);
    if (iterator.type !== 'ITERATOR') {
      throw new Error('Expected iterator');
    }
    iterator.input.items = '{{missing.items}}';
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts a loop body returning to its iterator', () => {
    expect(workflowManifestSchema.safeParse(workflow).success).toBe(true);
  });

  it('rejects ordinary cycles inside a loop body', () => {
    const invalid = structuredClone(workflow);
    getStep(invalid, 1).nextStepIds = [delayId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects returning to an iterator from its completed branch', () => {
    const invalid = structuredClone(workflow);
    getStep(invalid, 2).nextStepIds = [iteratorId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects an iterator pointing to itself as its loop body', () => {
    const invalid = structuredClone(workflow);
    const iterator = getStep(invalid, 0);
    if (iterator.type !== 'ITERATOR') {
      throw new Error('Expected iterator');
    }
    iterator.input.initialLoopStepIds = [iteratorId, delayId];
    expect(workflowManifestSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('workflow manifest step types', () => {
  it.each(['SEND_EMAIL', 'DRAFT_EMAIL', 'CREATE_CALENDAR_EVENT'])(
    'rejects %s steps',
    (type) => {
      const invalid = structuredClone(workflow);
      Object.assign(getStep(invalid, 2), { type });
      const result = workflowManifestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual([
        'version',
        'steps',
        2,
        'type',
      ]);
    },
  );
});
