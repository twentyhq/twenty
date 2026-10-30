export type IdentifyAccountPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  // Provisional token from the code exchange, persisted only once the account is accepted.
  accessToken: string;
};

export type IdentifiedAccount = {
  externalAccountId: string;
  handle?: string;
};

// externalAccountId null is the explicit opt-out of providers without a stable id.
export type IdentifyAccountResult = {
  externalAccountId: string | null;
  handle?: string;
};
