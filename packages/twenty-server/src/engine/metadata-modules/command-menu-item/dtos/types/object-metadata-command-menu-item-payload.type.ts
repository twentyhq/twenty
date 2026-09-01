// Legacy shape kept out of the GraphQL schema: pre-2-38 upgrade commands
// replayed during sequential upgrades still write it, and the 2-38 payload
// rewrite nulls it in favour of navigationTargetObjectMetadataId.
export type ObjectMetadataCommandMenuItemPayload = {
  objectMetadataItemId: string;
};
