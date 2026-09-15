import { capitalize } from 'twenty-shared/utils';

import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';
import { getParsedNameFromDisplayName } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-display-name.util';
import { getParsedNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-handle.util';

export const getFirstNameAndLastNameFromHandleAndDisplayName = (
  handle: string,
  displayName: string,
): ParsedName => {
  const fromDisplayName = getParsedNameFromDisplayName(displayName);
  const fromHandle = getParsedNameFromHandle(handle);

  return {
    firstName: capitalize(fromDisplayName.firstName || fromHandle.firstName),
    lastName: capitalize(fromDisplayName.lastName || fromHandle.lastName),
  };
};
