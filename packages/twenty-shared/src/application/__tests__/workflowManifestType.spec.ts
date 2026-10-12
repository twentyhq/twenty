/** @jest-environment node */

import { APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES } from '@/application/constants/ApplicationWorkflowUnavailableStepTypes';
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
  it.each(APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES)(
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

describe('workflow manifest manual trigger', () => {
  const OBJECT_ID = '99999999-9999-4999-8999-999999999999';

  const withTrigger = (trigger: Record<string, unknown>) => ({
    ...workflow,
    version: {
      ...workflow.version,
      trigger: { ...workflow.version.trigger, ...trigger },
    },
  });

  it('accepts where the workflow can be launched from', () => {
    for (const availability of [
      { type: 'GLOBAL' },
      { type: 'SINGLE_RECORD', objectUniversalIdentifier: OBJECT_ID },
      { type: 'BULK_RECORDS', objectUniversalIdentifier: OBJECT_ID },
    ]) {
      expect(
        workflowManifestSchema.safeParse(
          withTrigger({ settings: { availability, icon: 'IconBolt' } }),
        ).success,
      ).toBe(true);
    }
  });

  it('requires the object a record availability runs on', () => {
    const result = workflowManifestSchema.safeParse(
      withTrigger({ settings: { availability: { type: 'SINGLE_RECORD' } } }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      'version',
      'trigger',
      'settings',
      'availability',
      'objectUniversalIdentifier',
    ]);
  });

  it('needs an availability before an icon or pin can show in the command menu', () => {
    const result = workflowManifestSchema.safeParse(
      withTrigger({ settings: { isPinned: true } }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      'version',
      'trigger',
      'settings',
      'availability',
    ]);
  });

  it('names the supported trigger types when the type is unknown', () => {
    const result = workflowManifestSchema.safeParse(
      withTrigger({ type: 'WEBHOOK' }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'Unsupported trigger type. Application workflows support: MANUAL, CRON',
    );
  });
});

describe('workflow manifest cron trigger', () => {
  const withCron = (settings: Record<string, unknown>) => ({
    ...workflow,
    version: {
      ...workflow.version,
      trigger: {
        universalIdentifier: workflow.version.trigger.universalIdentifier,
        type: 'CRON',
        nextStepIds: workflow.version.trigger.nextStepIds,
        settings,
      },
    },
  });

  it('accepts every schedule type', () => {
    for (const settings of [
      { type: 'DAYS', schedule: { day: 1, hour: 9, minute: 0 } },
      { type: 'HOURS', schedule: { hour: 2, minute: 30 } },
      { type: 'MINUTES', schedule: { minute: 15 } },
      { type: 'CUSTOM', pattern: '0 9 * * 1-5' },
    ]) {
      expect(workflowManifestSchema.safeParse(withCron(settings)).success).toBe(
        true,
      );
    }
  });

  it('rejects a schedule outside the clock', () => {
    const result = workflowManifestSchema.safeParse(
      withCron({ type: 'DAYS', schedule: { day: 1, hour: 24, minute: 0 } }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      'version',
      'trigger',
      'settings',
      'schedule',
      'hour',
    ]);
  });

  it('rejects a schedule key the schedule type does not use', () => {
    const result = workflowManifestSchema.safeParse(
      withCron({ type: 'MINUTES', schedule: { minute: 15, hour: 2 } }),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      'version',
      'trigger',
      'settings',
      'schedule',
    ]);
  });
});
