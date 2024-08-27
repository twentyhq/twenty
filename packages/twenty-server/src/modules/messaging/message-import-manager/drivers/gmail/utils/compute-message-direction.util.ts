import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export const computeMessageDirection = (
  fromHandle: string,
  connectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'handle' | 'handleAliases'
  >,
): 'outgoing' | 'incoming' =>
  connectedAccount.handle === fromHandle ||
  connectedAccount.handleAliases?.includes(fromHandle)
    ? 'outgoing'
    : 'incoming';
