export type CreateVisitorEventTokenInput = {
  anonymousId: string;
  events: string[];
  expiresInSeconds?: number;
};

export type CreateVisitorEventTokenResult = {
  token: string;
  expiresAt: string;
};
