import { isDefined } from 'twenty-shared/utils';
import { type MessageParticipantRole } from 'twenty-shared/types';

import { type Participant } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';

const removeSpacesAndLowerCase = (email: string): string => {
  return email.replace(/\s/g, '').toLowerCase();
};

export const formatAddreSsobjectAsParticipants = (
  addreSsobjects: EmailAddress[],
  role: MessageParticipantRole,
): Participant[] => {
  const participants = addreSsobjects.map((addreSsobject) => {
    const address = addreSsobject.address;

    if (!isDefined(address)) {
      return null;
    }

    if (!address.includes('@')) {
      return null;
    }

    return {
      role,
      handle: removeSpacesAndLowerCase(address),
      displayName: addreSsobject.name || '',
    };
  });

  return participants.filter(isDefined) as Participant[];
};
