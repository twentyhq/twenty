import { omitReadDeniedFieldsFromTimelineActivityProperties } from 'src/modules/timeline/utils/omit-read-denied-fields-from-timeline-activity-properties.util';

const READ_DENIED_FIELD_NAMES = new Set(['jobTitle']);

describe('omitReadDeniedFieldsFromTimelineActivityProperties', () => {
  it('should omit read-denied fields from the diff', () => {
    expect(
      omitReadDeniedFieldsFromTimelineActivityProperties({
        properties: {
          diff: {
            jobTitle: { before: 'Engineer', after: 'Manager' },
            city: { before: 'Paris', after: 'Lyon' },
          },
        },
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }),
    ).toEqual({ diff: { city: { before: 'Paris', after: 'Lyon' } } });
  });

  it('should omit read-denied fields from before, after and updatedFields', () => {
    expect(
      omitReadDeniedFieldsFromTimelineActivityProperties({
        properties: {
          before: { jobTitle: 'Engineer', city: 'Paris' },
          after: { jobTitle: 'Manager', city: 'Lyon' },
          updatedFields: ['jobTitle', 'city'],
        },
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }),
    ).toEqual({
      before: { city: 'Paris' },
      after: { city: 'Lyon' },
      updatedFields: ['city'],
    });
  });

  it('should keep the properties unchanged without read-denied fields', () => {
    const properties = { diff: { jobTitle: { before: 'a', after: 'b' } } };

    expect(
      omitReadDeniedFieldsFromTimelineActivityProperties({
        properties,
        readDeniedFieldNames: new Set(),
      }),
    ).toBe(properties);
  });

  it('should keep non-object properties unchanged', () => {
    expect(
      omitReadDeniedFieldsFromTimelineActivityProperties({
        properties: null,
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }),
    ).toBeNull();
  });
});
