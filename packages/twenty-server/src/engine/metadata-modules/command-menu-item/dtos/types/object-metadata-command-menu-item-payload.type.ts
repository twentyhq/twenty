// Legacy shape kept out of the GraphQL schema: pre-2-38 upgrade commands
// replayed during sequential upgrades still write it, and the 2-38 slow
// migration erases it in favour of navigationTargetObjectMetadataId.
export type ObjectMetadataCommandMenuItemPayload = {
  objectMetadataItemId: string;
};
