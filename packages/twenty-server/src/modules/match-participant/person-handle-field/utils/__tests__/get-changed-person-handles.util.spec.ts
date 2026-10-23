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
  it('sees a value added next to a duplicated one', () => {
    const withAdditionalPhone = (number: string) => ({
      phones: {
        primaryPhoneNumber: '611111111',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'FR',
        additionalPhones: [{ number, callingCode: '+33', countryCode: 'FR' }],
      },
    });

    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          {
            personId: 'person-a',
            before: withAdditionalPhone('611111111'),
            after: withAdditionalPhone('622222222'),
          },
        ],
      }),
    ).toEqual({
      handles: ['+33611111111', '+33622222222'],
      changedPersonIds: ['person-a'],
    });
  });

  it('returns the values of a destroyed person', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          {
            personId: 'person-a',
            before: buildPerson('611111111'),
            after: null,
          },
        ],
      }),
    ).toEqual({ handles: ['+33611111111'], changedPersonIds: ['person-a'] });
  });

  it('returns the values before and after a change', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          {
            personId: 'person-a',
            before: buildPerson('611111111'),
            after: buildPerson('622222222'),
          },
        ],
      }),
    ).toEqual({
      handles: ['+33611111111', '+33622222222'],
      changedPersonIds: ['person-a'],
    });
  });

  it('returns the values of a created person', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          {
            personId: 'person-a',
            before: null,
            after: buildPerson('611111111'),
          },
        ],
      }),
    ).toEqual({ handles: ['+33611111111'], changedPersonIds: ['person-a'] });
  });

  it('ignores people whose values did not change', () => {
    expect(
      getChangedPersonHandles({
        personHandleField,
        personChanges: [
          {
            personId: 'person-a',
            before: buildPerson('611111111'),
            after: buildPerson('611111111'),
          },
        ],
      }),
    ).toEqual({ handles: [], changedPersonIds: [] });
  });
});
