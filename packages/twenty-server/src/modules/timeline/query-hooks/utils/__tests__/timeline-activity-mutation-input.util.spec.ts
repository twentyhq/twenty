import {
  assertTimelineActivityCreationInputIsValid,
  assertTimelineActivityTypeIsNotUpdated,
  stampTimelineActivityTypeSnapshots,
} from 'src/modules/timeline/query-hooks/utils/timeline-activity-mutation-input.util';

const TYPE_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000004';

const snapshot = {
  id: TYPE_ID,
  universalIdentifier: '00000000-0000-4000-8000-000000000002',
  name: 'deploymentCompleted',
  label: 'completed a deployment',
  action: 'updated' as const,
  icon: 'IconRocket',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: '00000000-0000-4000-8000-000000000003',
};

const resolvedTimelineActivityTypeById = new Map([
  [
    TYPE_ID,
    {
      id: TYPE_ID,
      applicationId: APPLICATION_ID,
      snapshot,
    },
  ],
]);

describe('timeline activity mutation input', () => {
  it('replaces client-provided snapshots with the resolved snapshot', () => {
    expect(
      stampTimelineActivityTypeSnapshots({
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            timelineActivityTypeSnapshot: { label: 'forged' },
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
        ],
        resolvedTimelineActivityTypeById,
      }),
    ).toEqual([
      {
        timelineActivityTypeId: TYPE_ID,
        timelineActivityTypeSnapshot: snapshot,
        targetPersonId: '00000000-0000-4000-8000-000000000010',
      },
    ]);
  });

  it('rejects missing targets and partial linked records', () => {
    expect(() =>
      assertTimelineActivityCreationInputIsValid({
        records: [{ timelineActivityTypeId: TYPE_ID }],
      }),
    ).toThrow('A timeline activity requires exactly one target');
    expect(() =>
      assertTimelineActivityCreationInputIsValid({
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
            linkedRecordId: '00000000-0000-4000-8000-000000000012',
          },
        ],
      }),
    ).toThrow('complete linked record metadata');
  });

  it('accepts a nested target relation input', () => {
    expect(() =>
      assertTimelineActivityCreationInputIsValid({
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPerson: {
              connect: { id: '00000000-0000-4000-8000-000000000010' },
            },
          },
        ],
      }),
    ).not.toThrow();
  });

  it('rejects targets split across scalar and nested relation inputs', () => {
    expect(() =>
      assertTimelineActivityCreationInputIsValid({
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
            targetCompany: {
              connect: { id: '00000000-0000-4000-8000-000000000011' },
            },
          },
        ],
      }),
    ).toThrow('A timeline activity requires exactly one target');
  });

  it('rejects an untyped timeline activity', () => {
    expect(() =>
      assertTimelineActivityCreationInputIsValid({
        records: [
          {
            properties: {},
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
        ],
      }),
    ).toThrow('A timeline activity type is required on creation');
  });

  it('rejects upserts', () => {
    expect(() =>
      assertTimelineActivityCreationInputIsValid({ records: [], upsert: true }),
    ).toThrow('Timeline activities cannot be upserted');
  });

  it('prevents an application from writing another application type', () => {
    expect(() =>
      stampTimelineActivityTypeSnapshots({
        applicationId: '00000000-0000-4000-8000-000000000099',
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
        ],
        resolvedTimelineActivityTypeById,
      }),
    ).toThrow('An application can only create its own timeline activity types');
  });

  it('does not let an application attribute an activity to a workspace member', () => {
    const now = new Date('2026-08-23T12:00:00.000Z');

    expect(
      stampTimelineActivityTypeSnapshots({
        applicationId: APPLICATION_ID,
        now,
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
            workspaceMemberId: '00000000-0000-4000-8000-000000000011',
            happensAt: '2026-08-24T12:00:00.000Z',
          },
        ],
        resolvedTimelineActivityTypeById,
      }),
    ).toEqual([
      {
        timelineActivityTypeId: TYPE_ID,
        timelineActivityTypeSnapshot: snapshot,
        targetPersonId: '00000000-0000-4000-8000-000000000010',
        workspaceMemberId: null,
        happensAt: now.toISOString(),
      },
    ]);
  });

  it('rejects changing either immutable type field after creation', () => {
    expect(() =>
      assertTimelineActivityTypeIsNotUpdated([
        { timelineActivityTypeSnapshot: snapshot },
      ]),
    ).toThrow('A timeline activity type is immutable after creation');
    expect(() =>
      assertTimelineActivityTypeIsNotUpdated([
        { timelineActivityTypeId: TYPE_ID },
      ]),
    ).toThrow('A timeline activity type is immutable after creation');
    expect(() =>
      assertTimelineActivityTypeIsNotUpdated([{ properties: {} }]),
    ).not.toThrow();
  });
});
