import { keepReadableFieldsInTimelineActivityProperties } from 'src/modules/timeline/utils/keep-readable-fields-in-timeline-activity-properties.util';

const READABLE_FIELD_NAMES = new Set(['city']);

describe('keepReadableFieldsInTimelineActivityProperties', () => {
  it('should keep only readable fields in the diff', () => {
    expect(
      keepReadableFieldsInTimelineActivityProperties({
        properties: {
          diff: {
            jobTitle: { before: 'Engineer', after: 'Manager' },
            formerFieldName: { before: 'a', after: 'b' },
            city: { before: 'Paris', after: 'Lyon' },
          },
        },
        readableFieldNames: READABLE_FIELD_NAMES,
      }),
    ).toEqual({ diff: { city: { before: 'Paris', after: 'Lyon' } } });
  });

  it('should keep only readable fields in before, after and updatedFields', () => {
    expect(
      keepReadableFieldsInTimelineActivityProperties({
        properties: {
          before: { jobTitle: 'Engineer', city: 'Paris' },
          after: { jobTitle: 'Manager', city: 'Lyon' },
          updatedFields: ['jobTitle', 'city'],
        },
        readableFieldNames: READABLE_FIELD_NAMES,
      }),
    ).toEqual({
      before: { city: 'Paris' },
      after: { city: 'Lyon' },
      updatedFields: ['city'],
    });
  });

  it('should keep non-object properties unchanged', () => {
    expect(
      keepReadableFieldsInTimelineActivityProperties({
        properties: null,
        readableFieldNames: READABLE_FIELD_NAMES,
      }),
    ).toBeNull();
  });
});
