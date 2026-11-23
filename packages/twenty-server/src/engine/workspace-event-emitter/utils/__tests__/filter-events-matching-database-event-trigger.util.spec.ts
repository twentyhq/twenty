import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsMatchingDatabaseEventTrigger } from 'src/engine/workspace-event-emitter/utils/filter-events-matching-database-event-trigger.util';

const FIELDS = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'id',
        type: FieldMetadataType.UUID,
        universalIdentifier: 'company-id',
      },
      {
        name: 'employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'company-employees',
      },
    ],
  },
];

const buildEvent = (
  properties: Record<string, unknown>,
  recordId = 'record-1',
): ObjectRecordEvent => ({ recordId, properties }) as ObjectRecordEvent;

describe('filterEventsMatchingDatabaseEventTrigger', () => {
  it('should keep every event when the trigger has no condition', async () => {
    const events = [buildEvent({ after: { stage: 'NEW' } })];

    expect(
      await filterEventsMatchingDatabaseEventTrigger({
        events,
        eventName: 'opportunity.created',
        fields: FIELDS,
      }),
    ).toEqual({ events });
  });

  it('should keep only the created records the condition matches', async () => {
    const wonEvent = buildEvent({ after: { stage: 'WON' } }, 'won');
    const newEvent = buildEvent({ after: { stage: 'NEW' } }, 'new');

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [wonEvent, newEvent],
      eventName: 'opportunity.created',
      condition: 'stage == "WON"',
      fields: FIELDS,
    });

    expect(events).toEqual([wonEvent]);
  });

  it('should follow a field renamed after the condition was written', async () => {
    const wonEvent = buildEvent({ after: { stage: 'WON' } }, 'won');
    const newEvent = buildEvent({ after: { stage: 'NEW' } }, 'new');

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [wonEvent, newEvent],
      eventName: 'opportunity.created',
      condition: 'status == "WON"',
      conditionBindings: { status: 'opportunity-stage' },
      fields: FIELDS,
    });

    expect(events).toEqual([wonEvent]);
  });

  it('should read previous values on an update to match a transition', async () => {
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

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [becameWon, stayedWon],
      eventName: 'opportunity.updated',
      condition: 'stage == "WON" and previous.stage != "WON"',
      fields: FIELDS,
    });

    expect(events).toEqual([becameWon]);
  });

  it('should apply watched fields before the condition, on updates and upserts', async () => {
    const stageChanged = buildEvent(
      { before: {}, after: { stage: 'WON' }, updatedFields: ['stage'] },
      'stage-changed',
    );
    const nameChanged = buildEvent(
      { before: {}, after: { stage: 'WON' }, updatedFields: ['name'] },
      'name-changed',
    );

    for (const eventName of ['opportunity.updated', 'opportunity.upserted']) {
      const { events } = await filterEventsMatchingDatabaseEventTrigger({
        events: [stageChanged, nameChanged],
        eventName,
        watchedFields: ['stage'],
        condition: 'stage == "WON"',
        fields: FIELDS,
      });

      expect(events).toEqual([stageChanged]);
    }
  });

  it('should read a deleted record as it was before the deletion', async () => {
    const deletedWon = buildEvent({
      before: { stage: 'WON' },
      after: { stage: 'WON', deletedAt: '2026-09-23T10:00:00.000Z' },
    });

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [deletedWon],
      eventName: 'opportunity.deleted',
      condition: 'stage == "WON" and not isDefined(previous.stage)',
      fields: FIELDS,
    });

    expect(events).toEqual([deletedWon]);
  });

  it('should read a relation as the API shows it, without loading the related record for its id', async () => {
    const linked = buildEvent({ after: { companyId: 'company-1' } }, 'linked');
    const unlinked = buildEvent({ after: { companyId: null } }, 'unlinked');
    const findRelatedRecords = jest.fn();

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [linked, unlinked],
      eventName: 'opportunity.created',
      condition: 'company.id == "company-1"',
      fields: FIELDS,
      findRelatedRecords,
    });
    const { events: eventsWithoutCompany } =
      await filterEventsMatchingDatabaseEventTrigger({
        events: [linked, unlinked],
        eventName: 'opportunity.created',
        condition: 'not isDefined(company)',
        fields: FIELDS,
        findRelatedRecords,
      });

    expect(events).toEqual([linked]);
    expect(eventsWithoutCompany).toEqual([unlinked]);
    expect(findRelatedRecords).not.toHaveBeenCalled();
  });

  it('should load the fields of related records once for the whole batch', async () => {
    const bigCompany = buildEvent({ after: { companyId: 'big' } }, 'big');
    const smallCompany = buildEvent({ after: { companyId: 'small' } }, 'small');
    const sameBigCompany = buildEvent({ after: { companyId: 'big' } }, 'big-2');
    const findRelatedRecords = jest.fn().mockResolvedValue({
      relatedRecords: [
        { id: 'big', employees: 500 },
        { id: 'small', employees: 5 },
      ],
    });

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [bigCompany, smallCompany, sameBigCompany],
      eventName: 'opportunity.created',
      condition: 'company.employees > 100',
      fields: FIELDS,
      findRelatedRecords,
    });

    expect(events).toEqual([bigCompany, sameBigCompany]);
    expect(findRelatedRecords).toHaveBeenCalledTimes(1);
    expect(findRelatedRecords).toHaveBeenCalledWith({
      relationFieldName: 'company',
      recordIds: ['big', 'small'],
      fieldNames: ['employees'],
    });
  });

  it('should read a related record that was not returned as no relation', async () => {
    const deletedCompany = buildEvent({ after: { companyId: 'deleted' } });

    const { events } = await filterEventsMatchingDatabaseEventTrigger({
      events: [deletedCompany],
      eventName: 'opportunity.created',
      condition: 'not isDefined(company) and not isDefined(company.employees)',
      fields: FIELDS,
      findRelatedRecords: jest.fn().mockResolvedValue({ relatedRecords: [] }),
    });

    expect(events).toEqual([deletedCompany]);
  });

  it('should match nothing and report why when related records fail to load', async () => {
    expect(
      await filterEventsMatchingDatabaseEventTrigger({
        events: [buildEvent({ after: { companyId: 'company-1' } })],
        eventName: 'opportunity.created',
        condition: 'company.employees > 100',
        fields: FIELDS,
        findRelatedRecords: jest
          .fn()
          .mockResolvedValue({ errorMessage: 'Cannot read employees' }),
      }),
    ).toEqual({ events: [], conditionErrorMessage: 'Cannot read employees' });
  });

  it('should match nothing and report why when reading related records throws', async () => {
    expect(
      await filterEventsMatchingDatabaseEventTrigger({
        events: [buildEvent({ after: { companyId: 'company-1' } })],
        eventName: 'opportunity.created',
        condition: 'company.employees > 100',
        fields: FIELDS,
        findRelatedRecords: jest
          .fn()
          .mockRejectedValue(new Error('connection reset')),
      }),
    ).toEqual({
      events: [],
      conditionErrorMessage:
        'Cannot read the records of "company": connection reset',
    });
  });

  it('should reject previous values of a relation', async () => {
    const { events, conditionErrorMessage } =
      await filterEventsMatchingDatabaseEventTrigger({
        events: [buildEvent({ before: {}, after: {}, updatedFields: [] })],
        eventName: 'opportunity.updated',
        condition: 'previous.company.id != company.id',
        fields: FIELDS,
      });

    expect(events).toEqual([]);
    expect(conditionErrorMessage).toContain('previous values only cover');
  });

  it('should match nothing and report why when the condition cannot be read', async () => {
    const result = await filterEventsMatchingDatabaseEventTrigger({
      events: [buildEvent({ after: { stage: 'WON' } })],
      eventName: 'opportunity.created',
      condition: 'stage ==',
      fields: FIELDS,
    });

    expect(result.events).toEqual([]);
    expect(result.conditionErrorMessage).toEqual(expect.any(String));
  });

  it('should not match an object that does not have the condition field', async () => {
    expect(
      await filterEventsMatchingDatabaseEventTrigger({
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

  it('should not match a record whose relation the trigger cannot see', async () => {
    const withHiddenCompany = buildEvent({ after: { stage: 'NEW' } });

    expect(
      await filterEventsMatchingDatabaseEventTrigger({
        events: [withHiddenCompany],
        eventName: 'opportunity.created',
        condition: 'not isDefined(company)',
        fields: FIELDS,
      }),
    ).toEqual({
      events: [],
      conditionErrorMessage:
        'The condition reads a field this trigger cannot see',
    });
  });
});
