export const CONNECTED_ACCOUNT_DELETED_EVENT = 'connectedAccount_deleted';

export type ConnectedAccountDeletedEvent = {
  connectedAccountId: string;
  userWorkspaceId: string;
};
