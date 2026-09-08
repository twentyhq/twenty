export type OverrideAuthorContext = {
  workspaceCustomApplicationUniversalIdentifier: string;
  ownerApplicationUniversalIdentifier: string | undefined;
};

// Readers that only know the entity's owner still resolve correctly: the
// workspace custom application is the only author besides the owner, so any
// non-owner entry ranks first. Writers need the custom identifier to key.
export type OverrideAuthorReadContext = {
  workspaceCustomApplicationUniversalIdentifier?: string;
  ownerApplicationUniversalIdentifier: string | undefined;
};
