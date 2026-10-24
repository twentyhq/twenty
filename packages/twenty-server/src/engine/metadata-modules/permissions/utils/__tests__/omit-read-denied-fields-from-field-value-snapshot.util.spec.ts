import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';

const READ_DENIED_FIELD_NAMES = new Set(['jobTitle']);

describe('omitReadDeniedFieldsFromFieldValueSnapshot', () => {
  it('should omit read-denied fields from the diff', () => {
    expect(
      omitReadDeniedFieldsFromFieldValueSnapshot({
        snapshot: {
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
      omitReadDeniedFieldsFromFieldValueSnapshot({
        snapshot: {
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

  it('should keep the snapshot unchanged without read-denied fields', () => {
    const snapshot = { diff: { jobTitle: { before: 'a', after: 'b' } } };

    expect(
      omitReadDeniedFieldsFromFieldValueSnapshot({
        snapshot,
        readDeniedFieldNames: new Set(),
      }),
    ).toBe(snapshot);
  });

  it('should keep a non-object snapshot unchanged', () => {
    expect(
      omitReadDeniedFieldsFromFieldValueSnapshot({
        snapshot: null,
        readDeniedFieldNames: READ_DENIED_FIELD_NAMES,
      }),
    ).toBeNull();
  });
});
