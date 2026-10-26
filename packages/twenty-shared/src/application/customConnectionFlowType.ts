export type AuthorizeConnectionPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  callbackUrl: string;
};

export type AuthorizeConnectionResult = {
  authorizationUrl: string;
};

export type ConnectionCallbackPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  httpMethod: 'GET' | 'POST';
  queryStringParameters: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
  body: object | null;
  rawBody: string | null;
};

export type ConnectedAccountFromCallback = {
  externalAccountId: string;
  handle?: string;
  accessToken?: string;
};

export type ConnectionCallbackResult = ConnectedAccountFromCallback | null;
