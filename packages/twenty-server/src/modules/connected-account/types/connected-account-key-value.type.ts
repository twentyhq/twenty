export enum ConnectedAccountKeys {
  ACCOUNTS_TO_RECONNECT = 'ACCOUNTS_TO_RECONNECT',
}

export type ConnectedAccountKeyValueType = {
  [ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT]: string[];
};
