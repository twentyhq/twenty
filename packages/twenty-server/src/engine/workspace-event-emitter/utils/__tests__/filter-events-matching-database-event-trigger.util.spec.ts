import { FieldMetadataType } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsMatchingDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/filter-events-matching-database-event-trigger.util';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'companyId',
    type: FieldMetadataType.UUID,
    universalIdentifier: 'opportunity-company',
  },
];

const buildEvent = (
  properties: Record<string, unknown>,
  recordId = 'record-1',
): ObjectRecordEvent => ({ recordId, properties }) as ObjectRecordEvent;

describe('filterEventsMatchingDatabaseEventTrigger', () => {
  it('should keep every event when the trigger has no condition', () => {
    const events = [buildEvent({ after: { stage: 'NEW' } })];

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events,
        eventName: 'opportunity.created',
        fields: FIELDS,
      }),
    ).toEqual({ events });
  });

  it('should keep only the created records the condition matches', () => {
    const wonEvent = buildEvent({ after: { stage: 'WON' } }, 'won');
    const newEvent = buildEvent({ after: { stage: 'NEW' } }, 'new');

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [wonEvent, newEvent],
        eventName: 'opportunity.created',
        condition: 'stage == "WON"',
        fields: FIELDS,
      }).events,
    ).toEqual([wonEvent]);
  });

  it('should read previous values on an update to match a transition', () => {
    const becameWon = buildEvent(
      {
        before: { stage: 'MEETING' },
        after: { stage: 'WON' },
        updatedFields: ['stage'],
      },
      'became-won',
    );
    const stayedWon = buildEvent(
      {
        before: { stage: 'WON' },
        after: { stage: 'WON' },
        updatedFields: ['name'],
      },
      'stayed-won',
    );

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [becameWon, stayedWon],
        eventName: 'opportunity.updated',
        condition: 'stage == "WON" and previous.stage != "WON"',
        fields: FIELDS,
      }).events,
    ).toEqual([becameWon]);
  });

  it('should apply watched fields before the condition, on updates and upserts', () => {
    const stageChanged = buildEvent(
      { before: {}, after: { stage: 'WON' }, updatedFields: ['stage'] },
      'stage-changed',
    );
    const nameChanged = buildEvent(
      { before: {}, after: { stage: 'WON' }, updatedFields: ['name'] },
      'name-changed',
    );

    for (const eventName of ['opportunity.updated', 'opportunity.upserted']) {
      expect(
        filterEventsMatchingDatabaseEventTrigger({
          events: [stageChanged, nameChanged],
          eventName,
          watchedFields: ['stage'],
          condition: 'stage == "WON"',
          fields: FIELDS,
        }).events,
      ).toEqual([stageChanged]);
    }
  });

  it('should read a deleted record as it was before the deletion', () => {
    const deletedWon = buildEvent({
      before: { stage: 'WON' },
      after: { stage: 'WON', deletedAt: '2026-09-23T10:00:00.000Z' },
    });

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [deletedWon],
        eventName: 'opportunity.deleted',
        condition: 'stage == "WON" and not isDefined(previous.stage)',
        fields: FIELDS,
      }).events,
    ).toEqual([deletedWon]);
  });

  it('should match a relation by its join column', () => {
    const linked = buildEvent({ after: { companyId: 'company-1' } }, 'linked');
    const unlinked = buildEvent({ after: { companyId: null } }, 'unlinked');

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [linked, unlinked],
        eventName: 'opportunity.created',
        condition: 'isDefined(companyId)',
        fields: FIELDS,
      }).events,
    ).toEqual([linked]);
  });

  it('should match nothing and report why when the condition cannot be read', () => {
    const result = filterEventsMatchingDatabaseEventTrigger({
      events: [buildEvent({ after: { stage: 'WON' } })],
      eventName: 'opportunity.created',
      condition: 'stage ==',
      fields: FIELDS,
    });

    expect(result.events).toEqual([]);
    expect(result.conditionErrorMessage).toEqual(expect.any(String));
  });

  it('should not match an object that does not have the condition field', () => {
    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [buildEvent({ after: { stage: 'NEW' } })],
        eventName: '*.created',
        condition: "status != 'DONE'",
        fields: FIELDS,
      }),
    ).toEqual({
      events: [],
      conditionErrorMessage: 'Unknown field "status"',
    });
  });

  it('should not match a record whose condition field the trigger cannot see', () => {
    const withCompany = buildEvent({ after: { stage: 'NEW' } }, 'hidden');

    expect(
      filterEventsMatchingDatabaseEventTrigger({
        events: [withCompany],
        eventName: 'opportunity.created',
        condition: 'not isDefined(companyId)',
        fields: FIELDS,
      }),
    ).toEqual({
      events: [],
      conditionErrorMessage:
        'The condition reads a field this trigger cannot see',
    });
  });
});
