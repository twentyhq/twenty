import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

/**
 * Normalizes an email address for comparison by trimming whitespace
 * and converting to lowercase. This ensures case-insensitive matching
 * which is required by RFC 5321 for the local part in practice.
 */
const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Determines whether a message is OUTGOING (sent by the connected account)
 * or INCOMING (received from someone else).
 *
 * Fix for issue #20011: The comparison is now case-insensitive to correctly
 * identify outgoing emails where the From header casing may differ from the
 * stored account handle or its aliases.
 */
export const computeMessageDirection = (
  fromHandle: string,
  connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
): MessageDirection => {
  const normalizedFrom = normalizeEmail(fromHandle);
  const normalizedHandle = normalizeEmail(connectedAccount.handle);

  if (normalizedFrom === normalizedHandle) {
    return MessageDirection.OUTGOING;
  }

  const aliases = connectedAccount.handleAliases ?? [];

  if (aliases.some((alias) => normalizeEmail(alias) === normalizedFrom)) {
    return MessageDirection.OUTGOING;
  }

  return MessageDirection.INCOMING;
};
