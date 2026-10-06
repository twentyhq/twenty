import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsByTriggerConditions } from 'src/engine/workspace-event-emitter/utils/filter-events-by-trigger-conditions.util';

const buildEvent = ({
  recordId,
  before,
  after,
}: {
  recordId: string;
  before?: object;
  after?: object;
}): ObjectRecordEvent =>
  ({
    recordId,
    properties: { before, after },
  }) as ObjectRecordEvent;

const linked = buildEvent({
  recordId: 'linked',
  before: { personId: null },
  after: { personId: 'person-1' },
});
const unlinked = buildEvent({
  recordId: 'unlinked',
  before: { personId: 'person-1' },
  after: { personId: null },
});

describe('filterEventsByTriggerConditions', () => {
  it('passes everything through without conditions', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked, unlinked],
        eventName: 'messageParticipant.updated',
        conditions: undefined,
        actor: { type: 'system' },
      }),
    ).toEqual([linked, unlinked]);
  });

  it('drops the whole batch when the actor is not accepted', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked],
        eventName: 'messageParticipant.updated',
        conditions: { actor: ['user'] },
        actor: { type: 'system' },
      }),
    ).toEqual([]);
  });

  it('drops the whole batch when the actor is unknown and one is required', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked],
        eventName: 'messageParticipant.updated',
        conditions: { actor: ['system'] },
        actor: undefined,
      }),
    ).toEqual([]);
  });

  it('keeps the batch of an accepted actor', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked],
        eventName: 'messageParticipant.updated',
        conditions: { actor: ['system', 'user'] },
        actor: { type: 'system' },
      }),
    ).toEqual([linked]);
  });

  it('evaluates the record condition on the record after the write', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked, unlinked],
        eventName: 'messageParticipant.updated',
        conditions: { record: { personId: { is: 'NOT_NULL' } } },
        actor: { type: 'system' },
      }),
    ).toEqual([linked]);
  });

  it('evaluates the record condition on the record before a deletion', () => {
    expect(
      filterEventsByTriggerConditions({
        events: [linked, unlinked],
        eventName: 'messageParticipant.deleted',
        conditions: { record: { personId: { is: 'NOT_NULL' } } },
        actor: { type: 'system' },
      }),
    ).toEqual([unlinked]);
  });
});
