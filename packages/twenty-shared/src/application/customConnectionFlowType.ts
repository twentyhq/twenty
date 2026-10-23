export type AuthorizeConnectionPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  // Carries the signed connection state; hand it to the upstream service as
  // its return URL and/or notification URL.
  callbackUrl: string;
};

export type AuthorizeConnectionResult = {
  authorizationUrl: string;
};

export type ConnectionCallbackPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  httpMethod: 'GET' | 'POST';
  // Query parameters other than the signed state.
  queryStringParameters: Record<string, string | undefined>;
  body: object | null;
};

export type ConnectedAccountFromCallback = {
  externalAccountId: string;
  handle?: string;
  accessToken?: string;
};

// null when the request carries no account to save yet, e.g. the browser
// returning before the upstream service notified the callback URL.
export type ConnectionCallbackResult = ConnectedAccountFromCallback | null;
