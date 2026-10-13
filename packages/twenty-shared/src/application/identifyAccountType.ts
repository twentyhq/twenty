export type IdentifyAccountPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  // Provisional token from the code exchange, not yet persisted: core only
  // saves it once the identified account is accepted.
  accessToken: string;
};

export type IdentifyAccountResult = {
  // Stable upstream id (team, organization, user...). Core refuses a reconnect
  // that resolves to a different id than the one stored on first connect.
  externalAccountId: string;
  handle?: string;
};
