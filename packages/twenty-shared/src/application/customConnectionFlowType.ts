export type AuthorizeConnectionPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  // Carries the signed state; give it to the service as its return and/or notification URL.
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
  // Lowercased; cookies and other credential headers are left out.
  headers: Record<string, string | undefined>;
  body: object | null;
  // The exact request bytes as UTF-8, for verifying a webhook signature; null on GET.
  rawBody: string | null;
};

export type ConnectedAccountFromCallback = {
  externalAccountId: string;
  handle?: string;
  accessToken?: string;
};

// null when the request carries no account yet, e.g. a browser return ahead of the notification.
export type ConnectionCallbackResult = ConnectedAccountFromCallback | null;
