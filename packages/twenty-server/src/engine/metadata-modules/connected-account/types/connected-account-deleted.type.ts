export type ConnectedAccountDeletedEvent = {
  connectedAccountId: string;
  userWorkspaceId: string;
  skipDataCleanup?: boolean;
};
