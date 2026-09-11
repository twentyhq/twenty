export type OverrideAuthorContext = {
  workspaceCustomApplicationUniversalIdentifier: string;
  ownerApplicationUniversalIdentifier: string | undefined;
};

export type OverrideAuthorReadContext = {
  workspaceCustomApplicationUniversalIdentifier?: string;
  ownerApplicationUniversalIdentifier: string | undefined;
};
