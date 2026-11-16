export type MetadataOwnershipIndex = {
  ownerUserWorkspaceIdByPrivateRootId: Partial<Record<string, string | null>>;
  privateRootIdsByOwnerUserWorkspaceId: Partial<Record<string, string[]>>;
  ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName: Partial<
    Record<string, Partial<Record<string, string | null>>>
  >;
};
