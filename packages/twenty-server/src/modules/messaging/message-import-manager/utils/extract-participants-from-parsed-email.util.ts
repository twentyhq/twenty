import { type Email as ParsedEmail } from 'postal-mime';
import { MessageParticipantRole } from 'twenty-shared/types';

import { extractAddressesFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-addresses-from-parsed-email.util';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';

export const extractParticipantsFromParsedEmail = (parsed: ParsedEmail) => {
  const addressFields = [
    { field: parsed.from, role: MessageParticipantRole.FROM },
    { field: parsed.to, role: MessageParticipantRole.TO },
    { field: parsed.cc, role: MessageParticipantRole.CC },
    { field: parsed.bcc, role: MessageParticipantRole.BCC },
  ] as const;

  return addressFields.flatMap(({ field, role }) =>
    formatAddressObjectAsParticipants(
      extractAddressesFromParsedEmail(field),
      role,
    ),
  );
};
