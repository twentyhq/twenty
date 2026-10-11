export type ConnectionAccountIdentity = {
  externalAccountId: string;
  handle?: string;
};

export type IdentifyConnectionAccountInput = {
  connectionProviderId: string;
  connectionProviderName: string;
  accessToken: string;
  scopes: string[];
};
