// path is null on object navigation rows: their target lives in
// commandMenuItem.navigationTargetObjectMetadataId, the modelled relation.
export type PathCommandMenuItemPayload = {
  path: string | null;
};
