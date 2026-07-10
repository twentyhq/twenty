import { isNonEmptyString } from '@sniptt/guards';

import { type EmailAddressWithDisplayName } from '@/types';

export const formatEmailAddressWithDisplayName = ({
  address,
  displayName,
}: EmailAddressWithDisplayName): string => {
  if (!isNonEmptyString(displayName)) {
    return address;
  }

  const requiresQuoting = /[,;<>@"]/.test(displayName);
  const formattedDisplayName = requiresQuoting
    ? `"${displayName.replace(/"/g, '\\"')}"`
    : displayName;

  return `${formattedDisplayName} <${address}>`;
};
