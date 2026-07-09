import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

export const filterOutPhoneContactsThatBelongToConnectedAccount = (
  contacts: Contact[],
  connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
): Contact[] => {
  const connectedAccountPhoneNumbers = [
    connectedAccount.handle,
    ...(connectedAccount.handleAliases ?? []),
  ]
    .map((handle) => parsePhoneHandle(handle)?.primaryPhoneNumber)
    .filter(isDefined);

  return contacts.filter((contact) => {
    const contactPhoneNumber = parsePhoneHandle(
      contact.handle,
    )?.primaryPhoneNumber;

    return (
      !isDefined(contactPhoneNumber) ||
      !connectedAccountPhoneNumbers.includes(contactPhoneNumber)
    );
  });
};
