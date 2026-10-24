import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { omitReadDeniedFieldsFromTimelineActivityEvent } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-timeline-activity-event.util';

const READ_DENIED_FIELD_NAMES = new Set(['jobTitle']);

describe('omitReadDeniedFieldsFromTimelineActivityEvent', () => {
  it('should omit read-denied fields from the created activity', () => {
    const createdEvent: ObjectRecordCreateEvent = {
      recordId: 'timeline-activity-id',
      properties: {
        after: {
          id: 'timeline-activity-id',
          properties: {
            diff: {
              jobTitle: { before: 'Engineer', after: 'Manager' },
              city: { before: 'Paris', after: 'Lyon' },
            },
          },
        },
      },
    };

    expect(
      omitReadDeniedFieldsFromTimelineActivityEvent({
        event: createdEvent,
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }).properties,
    ).toEqual({
      after: {
        id: 'timeline-activity-id',
        properties: { diff: { city: { before: 'Paris', after: 'Lyon' } } },
      },
    });
  });

  it('should omit read-denied fields from an updated activity', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'timeline-activity-id',
      properties: {
        updatedFields: ['properties'],
        before: {
          properties: { diff: { jobTitle: { before: 'a', after: 'b' } } },
        },
        after: {
          properties: { diff: { jobTitle: { before: 'b', after: 'c' } } },
        },
        diff: {
          properties: {
            before: { diff: { jobTitle: { before: 'a', after: 'b' } } },
            after: { diff: { jobTitle: { before: 'b', after: 'c' } } },
          },
        },
      },
    };

    expect(
      omitReadDeniedFieldsFromTimelineActivityEvent({
        event: updatedEvent,
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }).properties,
    ).toEqual({
      updatedFields: ['properties'],
      before: { properties: { diff: {} } },
      after: { properties: { diff: {} } },
      diff: { properties: { before: { diff: {} }, after: { diff: {} } } },
    });
  });

  it('should keep the event unchanged without read-denied fields', () => {
    const createdEvent: ObjectRecordCreateEvent = {
      recordId: 'timeline-activity-id',
      properties: { after: { properties: { diff: {} } } },
    };

    expect(
      omitReadDeniedFieldsFromTimelineActivityEvent({
        event: createdEvent,
        readDeniedFieldNames: new Set(),
      }),
    ).toBe(createdEvent);
  });
});
