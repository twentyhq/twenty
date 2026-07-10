import { isNonEmptyString } from '@sniptt/guards';
import { formatEmailAddressWithDisplayName } from 'twenty-shared/utils';

import { mimeEncode } from 'src/modules/messaging/message-import-manager/utils/mime-encode.util';

const PRINTABLE_ASCII_ONLY_REGEX = /^[\x20-\x7e]*$/;

export const formatMessageFromHeader = ({
  fromEmail,
  fromName,
}: {
  fromEmail: string;
  fromName?: string | null;
}) => {
  if (!isNonEmptyString(fromName)) {
    return fromEmail;
  }

  if (PRINTABLE_ASCII_ONLY_REGEX.test(fromName)) {
    return formatEmailAddressWithDisplayName({
      address: fromEmail,
      displayName: fromName,
    });
  }

  return `${mimeEncode(fromName)} <${fromEmail}>`;
};
