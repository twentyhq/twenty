import { isNonEmptyString } from '@sniptt/guards';
import { parseEmailAddressList } from 'twenty-shared/utils';

import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';

export const safeParseEmailAddresses = (header: string): EmailAddress[] => {
  return parseEmailAddressList(header).filter((parsedAddress) =>
    isNonEmptyString(parsedAddress.address),
  );
};
