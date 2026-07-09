import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { computePhoneContactsThatNeedPersonCreateAndRestore } from 'src/modules/contact-creation-manager/utils/compute-phone-contacts-that-need-person-create-and-restore.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('computePhoneContactsThatNeedPersonCreateAndRestore', () => {
  const phoneContact: Contact = {
    handle: '14155552671',
    displayName: 'John Doe',
  };

  const existingPersonWithPhone = {
    id: 'phone-person-1',
    phones: {
      primaryPhoneNumber: '4155552671',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    },
    deletedAt: null,
  } as unknown as PersonWorkspaceEntity;

  it('should mark a new phone contact for person creation', () => {
    const result = computePhoneContactsThatNeedPersonCreateAndRestore({
      uniqueContacts: [phoneContact],
      alreadyCreatedPeople: [],
    });

    expect(result.contactsThatNeedPersonCreate).toEqual([phoneContact]);
    expect(result.contactsThatNeedPersonRestore).toEqual([]);
  });

  it('should not re-create a person that already exists with the same phone', () => {
    const result = computePhoneContactsThatNeedPersonCreateAndRestore({
      uniqueContacts: [phoneContact],
      alreadyCreatedPeople: [existingPersonWithPhone],
    });

    expect(result.contactsThatNeedPersonCreate).toEqual([]);
    expect(result.contactsThatNeedPersonRestore).toEqual([]);
    expect(result.existingPersonByHandle.get(phoneContact.handle)?.id).toBe(
      'phone-person-1',
    );
  });

  it('should dedup a plus-prefixed handle against the same stored phone', () => {
    const result = computePhoneContactsThatNeedPersonCreateAndRestore({
      uniqueContacts: [{ handle: '+14155552671', displayName: 'John Doe' }],
      alreadyCreatedPeople: [existingPersonWithPhone],
    });

    expect(result.contactsThatNeedPersonCreate).toEqual([]);
  });

  it('should mark a soft-deleted person matched by phone for restore', () => {
    const result = computePhoneContactsThatNeedPersonCreateAndRestore({
      uniqueContacts: [phoneContact],
      alreadyCreatedPeople: [
        {
          ...existingPersonWithPhone,
          deletedAt: new Date(),
        } as unknown as PersonWorkspaceEntity,
      ],
    });

    expect(result.contactsThatNeedPersonCreate).toEqual([]);
    expect(result.contactsThatNeedPersonRestore).toEqual([phoneContact]);
  });
});
