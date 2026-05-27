import addressparser from 'addressparser';

import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';

export const safeParseEmailAddresses = (header: string): EmailAddress[] => {
  try {
    return addressparser(header)
      .filter((parsed) => parsed.address)
      .map((parsed) => ({
        address: parsed.address,
        name: parsed.name ?? '',
      }));
  } catch {
    return [];
  }
};
