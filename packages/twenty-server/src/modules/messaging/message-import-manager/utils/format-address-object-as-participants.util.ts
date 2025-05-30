import addressparser from 'addressparser';

import { Participant } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { sanitizeEmailAddress } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/sanitize-string.util';

const formatAddressObjectAsArray = (
  addressObject: addressparser.EmailAddress | addressparser.EmailAddress[],
): addressparser.EmailAddress[] => {
  return Array.isArray(addressObject) ? addressObject : [addressObject];
};

const removeSpacesAndLowerCase = (email: string): string => {
  return email.replace(/\s/g, '').toLowerCase();
};

/**
 * Formats an address object into participants with proper error handling and sanitization
 */
export const formatAddressObjectAsParticipants = (
  addressObject:
    | addressparser.EmailAddress
    | addressparser.EmailAddress[]
    | undefined,
  role: 'from' | 'to' | 'cc' | 'bcc',
): Participant[] => {
  if (!addressObject) return [];
  
  try {
    const addressObjects = formatAddressObjectAsArray(addressObject);

    const participants = addressObjects.map((addressObject) => {
      const address = addressObject.address;
      
      // Skip invalid addresses
      if (!address) {
        return null;
      }

      // Sanitize the email address
      const sanitizedAddress = sanitizeEmailAddress(address);
      
      // Skip if sanitization resulted in an invalid email
      if (!sanitizedAddress.includes('@')) {
        return null;
      }

      return {
        role,
        handle: removeSpacesAndLowerCase(sanitizedAddress),
        displayName: addressObject.name ? addressObject.name.normalize('NFKC') : '',
      };
    });

    // Filter out any null entries from failed parsing
    return participants.filter((p): p is Participant => p !== null);
  } catch (error) {
    // Log the error but don't throw - return empty array instead
    console.error('Error formatting address object:', error);
    return [];
  }
};
