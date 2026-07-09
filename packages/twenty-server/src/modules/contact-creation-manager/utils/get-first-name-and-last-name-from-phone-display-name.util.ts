import { capitalize, isDefined } from 'twenty-shared/utils';

import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';
import { getParsedNameFromDisplayName } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-display-name.util';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

export const getFirstNameAndLastNameFromPhoneDisplayName = (
  displayName: string,
): ParsedName => {
  const parsedName = isDefined(parsePhoneHandle(displayName))
    ? { firstName: '', lastName: '' }
    : getParsedNameFromDisplayName(displayName);

  return {
    firstName: capitalize(parsedName.firstName),
    lastName: capitalize(parsedName.lastName),
  };
};
