import { FieldMetadataType } from 'twenty-shared/types';

import { getChangedPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-changed-person-handles.util';

const personHandleField = {
  name: 'phones',
  type: FieldMetadataType.PHONES,
} as const;

const buildPerson = (primaryPhoneNumber: string) => ({
  phones: {
    primaryPhoneNumber,
    primaryPhoneCallingCode: '+33',
    primaryPhoneCountryCode: 'FR',
    additionalPhones: [],
  },
});

describe('getChangedPersonHandles', () => {
  it('returns the values before and after a change', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          { before: buildPerson('611111111'), after: buildPerson('622222222') },
        ],
      }),
    ).toEqual(['+33611111111', '+33622222222']);
  });

  it('returns the values of a created person', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [{ before: null, after: buildPerson('611111111') }],
      }),
    ).toEqual(['+33611111111']);
  });

  it('ignores people whose values did not change', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          { before: buildPerson('611111111'), after: buildPerson('611111111') },
        ],
      }),
    ).toEqual([]);
  });
});
