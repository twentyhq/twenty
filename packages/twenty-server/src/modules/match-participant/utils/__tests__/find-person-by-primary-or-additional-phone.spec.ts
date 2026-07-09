import { findPersonByPrimaryOrAdditionalPhone } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const buildPerson = ({
  id,
  primaryPhoneNumber,
  additionalPhones = null,
}: {
  id: string;
  primaryPhoneNumber: string;
  additionalPhones?: { number: string }[] | null;
}): PersonWorkspaceEntity => {
  const person: Pick<PersonWorkspaceEntity, 'id'> & {
    phones: {
      primaryPhoneNumber: string;
      primaryPhoneCallingCode: string;
      additionalPhones: { number: string }[] | null;
    };
  } = {
    id,
    phones: {
      primaryPhoneNumber,
      primaryPhoneCallingCode: '+1',
      additionalPhones,
    },
  };

  return person as unknown as PersonWorkspaceEntity;
};

describe('findPersonByPrimaryOrAdditionalPhone', () => {
  it('finds a person by primary phone number', () => {
    const people = [
      buildPerson({ id: 'person-1', primaryPhoneNumber: '4155552671' }),
      buildPerson({ id: 'person-2', primaryPhoneNumber: '5551234567' }),
    ];

    expect(
      findPersonByPrimaryOrAdditionalPhone({
        people,
        phoneNumber: '5551234567',
      })?.id,
    ).toBe('person-2');
  });

  it('finds a person by additional phone number when no primary matches', () => {
    const people = [
      buildPerson({
        id: 'person-1',
        primaryPhoneNumber: '4155552671',
        additionalPhones: [{ number: '5551234567' }],
      }),
    ];

    expect(
      findPersonByPrimaryOrAdditionalPhone({
        people,
        phoneNumber: '5551234567',
      })?.id,
    ).toBe('person-1');
  });

  it('prefers a primary phone match over an additional phone match', () => {
    const people = [
      buildPerson({
        id: 'person-1',
        primaryPhoneNumber: '4155552671',
        additionalPhones: [{ number: '5551234567' }],
      }),
      buildPerson({ id: 'person-2', primaryPhoneNumber: '5551234567' }),
    ];

    expect(
      findPersonByPrimaryOrAdditionalPhone({
        people,
        phoneNumber: '5551234567',
      })?.id,
    ).toBe('person-2');
  });

  it('returns undefined when no person matches', () => {
    const people = [
      buildPerson({ id: 'person-1', primaryPhoneNumber: '4155552671' }),
    ];

    expect(
      findPersonByPrimaryOrAdditionalPhone({
        people,
        phoneNumber: '5551234567',
      }),
    ).toBeUndefined();
  });

  it('never matches an empty phone number', () => {
    const people = [buildPerson({ id: 'person-1', primaryPhoneNumber: '' })];

    expect(
      findPersonByPrimaryOrAdditionalPhone({ people, phoneNumber: '' }),
    ).toBeUndefined();
  });
});
