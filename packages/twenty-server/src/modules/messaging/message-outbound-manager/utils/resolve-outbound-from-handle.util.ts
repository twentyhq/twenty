import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const resolveOutboundFromHandle = ({
  connectedAccount,
  requestedFromHandle,
}: {
  connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>;
  requestedFromHandle?: string;
}): string | undefined => {
  if (!isNonEmptyString(requestedFromHandle)) {
    return undefined;
  }

  const normalizedRequestedFromHandle = requestedFromHandle
    .trim()
    .toLowerCase();

  const allowedFromHandles = [
    connectedAccount.handle,
    ...(connectedAccount.handleAliases ?? []),
  ].filter(isNonEmptyString);

  const matchedFromHandle = allowedFromHandles.find(
    (allowedFromHandle) =>
      allowedFromHandle.trim().toLowerCase() === normalizedRequestedFromHandle,
  );

  if (!isDefined(matchedFromHandle)) {
    throw new Error(
      `Sender ${requestedFromHandle} is not the connected account handle nor one of its verified aliases`,
    );
  }

  return matchedFromHandle;
};
