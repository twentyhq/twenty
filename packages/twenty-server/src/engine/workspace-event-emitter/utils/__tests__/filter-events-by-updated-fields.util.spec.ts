import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';

const buildEvent = (updatedFields?: string[]): ObjectRecordEvent =>
  ({
    recordId: 'record-id',
    properties: { updatedFields },
  }) as ObjectRecordEvent;

describe('filterEventsByUpdatedFields', () => {
  const stageUpdate = buildEvent(['stage']);
  const nameUpdate = buildEvent(['name']);
  const updateWithoutFields = buildEvent();

  it('should keep every event of a non-update action', () => {
    expect(
      filterEventsByUpdatedFields({
        events: [stageUpdate, updateWithoutFields],
        eventName: 'opportunity.created',
        watchedFields: ['stage'],
      }),
    ).toEqual([stageUpdate, updateWithoutFields]);
  });

  it('should keep every update when no field is watched', () => {
    expect(
      filterEventsByUpdatedFields({
        events: [stageUpdate, nameUpdate],
        eventName: 'opportunity.updated',
        watchedFields: [],
      }),
    ).toEqual([stageUpdate, nameUpdate]);
  });

  it('should keep only updates touching a watched field', () => {
    expect(
      filterEventsByUpdatedFields({
        events: [stageUpdate, nameUpdate, updateWithoutFields],
        eventName: 'opportunity.updated',
        watchedFields: ['stage'],
      }),
    ).toEqual([stageUpdate]);
  });
});
