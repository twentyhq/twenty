// Payload shape persisted before 2.35 moved the target to
// navigationTargetObjectMetadataId, only upgrade commands still read it
export type LegacyObjectMetadataCommandMenuItemPayload = {
  objectMetadataItemId: string;
};
