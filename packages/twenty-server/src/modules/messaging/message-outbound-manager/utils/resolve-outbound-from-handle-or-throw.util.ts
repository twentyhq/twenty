import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { getSendableEmailHandles, isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';

export const resolveOutboundFromHandleOrThrow = ({
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

  const matchedFromHandle = getSendableEmailHandles(connectedAccount).find(
    (allowedFromHandle) =>
      allowedFromHandle.trim().toLowerCase() === normalizedRequestedFromHandle,
  );

  if (!isDefined(matchedFromHandle)) {
    throw new MessageChannelException(
      `Sender ${requestedFromHandle} is not the connected account handle nor one of its verified aliases`,
      MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      {
        userFriendlyMessage: msg`You cannot send from this address.`,
      },
    );
  }

  return matchedFromHandle;
};
