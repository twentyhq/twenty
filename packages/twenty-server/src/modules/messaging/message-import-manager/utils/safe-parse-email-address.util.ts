import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { safeParseEmailAddressAddress } from 'src/modules/messaging/message-import-manager/utils/safe-parse-email-address-address.util';

export const safeParseEmailAddress = (
  emailAddress: EmailAddress,
): EmailAddress => {
  return {
    address: safeParseEmailAddressAddress(emailAddress.address) || '',
    name: emailAddress.name,
  };
};
