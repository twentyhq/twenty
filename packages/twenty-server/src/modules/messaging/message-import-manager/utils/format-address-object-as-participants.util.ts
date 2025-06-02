import addressparser from 'addressparser';
import { isDefined } from 'class-validator';

import { Participant } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';

const formatAddressObjectAsArray = (
  addressObject: addressparser.EmailAddress | addressparser.EmailAddress[],
): addressparser.EmailAddress[] => {
  return Array.isArray(addressObject) ? addressObject : [addressObject];
};

const removeSpacesAndLowerCase = (email: string): string => {
  return email.replace(/\s/g, '').toLowerCase();
};

export const formatAddressObjectAsParticipants = (
  addressObject: addressparser.EmailAddress | addressparser.EmailAddress[],
  role: 'from' | 'to' | 'cc' | 'bcc',
): Participant[] => {
  if (!addressObject) return [];
  const addressObjects = formatAddressObjectAsArray(addressObject);

  const participants = addressObjects.map((addressObject) => {
    const address = addressObject.address;

    if (!isDefined(address)) {
      return null;
    }

    if (!address.includes('@')) {
      return null;
    }

    return {
      role,
      handle: removeSpacesAndLowerCase(address),
      displayName: addressObject.name || '',
    };
  });

  return participants.filter((p): p is Participant => p !== null);
};
