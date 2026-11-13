export type MetadataOwnershipIndex = {
  ownerUserWorkspaceIdByPrivateRootId: Partial<Record<string, string | null>>;
  privateRootIdsByOwnerUserWorkspaceId: Partial<Record<string, string[]>>;
  ownerUserWorkspaceIdByPrivateChildId: Partial<Record<string, string | null>>;
};
