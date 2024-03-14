import { AddressObject } from 'mailparser';

import { Participant } from 'src/workspace/messaging/types/gmail-message';

const formatAddressObjectAsArray = (
  addressObject: AddressObject | AddressObject[],
): AddressObject[] => {
  return Array.isArray(addressObject) ? addressObject : [addressObject];
};

const removeSpacesAndLowerCase = (email: string): string => {
  return email.replace(/\s/g, '').toLowerCase();
};

export const formatAddressObjectAsParticipants = (
  addressObject: AddressObject | AddressObject[] | undefined,
  role: 'from' | 'to' | 'cc' | 'bcc',
): Participant[] => {
  if (!addressObject) return [];
  const addressObjects = formatAddressObjectAsArray(addressObject);

  const participants = addressObjects.map((addressObject) => {
    const emailAdresses = addressObject.value;

    return emailAdresses.map((emailAddress) => {
      const { name, address } = emailAddress;

      return {
        role,
        handle: address ? removeSpacesAndLowerCase(address) : '',
        displayName: name || '',
      };
    });
  });

  return participants.flat();
};
