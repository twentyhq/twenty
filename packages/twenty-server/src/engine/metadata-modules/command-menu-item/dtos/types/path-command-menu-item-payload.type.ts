// Only path navigation rows carry a payload; object navigation rows have a
// null payload and their target in commandMenuItem.navigationTargetObjectMetadataId.
// path is null only when a legacy { objectMetadataItemId } row not yet nulled
// by the 2-38 payload rewrite is served through this shape.
export type PathCommandMenuItemPayload = {
  path: string | null;
};
