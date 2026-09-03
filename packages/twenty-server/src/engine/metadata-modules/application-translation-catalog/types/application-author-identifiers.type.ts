export type ApplicationAuthorIdentifiers = {
  standardApplicationId: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  universalIdentifierByApplicationId: Partial<Record<string, string>>;
};
