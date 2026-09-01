// Only path navigation rows carry a payload; object navigation rows have a
// null payload and their target in commandMenuItem.navigationTargetObjectMetadataId.
export type PathCommandMenuItemPayload = {
  path: string;
};
