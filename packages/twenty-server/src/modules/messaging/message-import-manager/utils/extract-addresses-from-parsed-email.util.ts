import { type Address } from 'postal-mime';

import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

export const extractAddressesFromParsedEmail = (
  address: Address | Address[] | undefined,
): EmailAddress[] => {
  if (!address) {
    return [];
  }

  const addresses = Array.isArray(address) ? address : [address];

  const mailboxes = addresses.flatMap((addr) =>
    addr.address ? [addr] : (addr.group ?? []),
  );

  return mailboxes
    .filter((mailbox) => mailbox.address)
    .map((mailbox) => ({
      address: mailbox.address,
      name: sanitizeString(mailbox.name || ''),
    }));
};
