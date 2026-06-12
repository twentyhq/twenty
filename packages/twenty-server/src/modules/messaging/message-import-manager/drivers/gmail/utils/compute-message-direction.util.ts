import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

export const computeMessageDirection = (
  fromHandle: string,
  connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
): MessageDirection =>
  connectedAccount.handle === fromHandle ||
  connectedAccount.handleAliases?.includes(fromHandle)
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
