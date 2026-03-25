import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

export const computeMessageDirection = (
  fromHandle: string,
  connectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'handle' | 'handleAliases'
  >,
): MessageDirection =>
  connectedAccount.handle === fromHandle ||
  connectedAccount.handleAliases?.includes(fromHandle)
    ? MessageDirection.OUTGOING
    : MessageDirection.INCOMING;
