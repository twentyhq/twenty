import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export interface SubscriptionSetupResult {
  providerSubscriptionId: string;
  expiresAt: Date;
}

export interface MessageChannelSubscriptionDriver {
  setupSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<SubscriptionSetupResult>;

  stopSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void>;

  renewSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<SubscriptionSetupResult>;
}
