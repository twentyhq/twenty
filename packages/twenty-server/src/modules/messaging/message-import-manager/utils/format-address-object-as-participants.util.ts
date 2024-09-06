import addressparser from 'addressparser';

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
  addressObject:
    | addressparser.EmailAddress
    | addressparser.EmailAddress[]
    | undefined,
  role: 'from' | 'to' | 'cc' | 'bcc',
): Participant[] => {
  if (!addressObject) return [];
  const addressObjects = formatAddressObjectAsArray(addressObject);

  const participants = addressObjects.map((addressObject) => {
    const address = addressObject.address;

    return {
      role,
      handle: address ? removeSpacesAndLowerCase(address) : '',
      displayName: addressObject.name || '',
    };
  });

  return participants.flat();
};
