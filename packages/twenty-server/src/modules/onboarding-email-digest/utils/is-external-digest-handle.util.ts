import { isNonEmptyString } from '@sniptt/guards';

import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';

export const isExternalDigestHandle = ({
  handle,
  ownHandles,
}: {
  handle: string;
  ownHandles: Set<string>;
}): boolean =>
  isNonEmptyString(handle) && !ownHandles.has(handle) && !isGroupEmail(handle);
