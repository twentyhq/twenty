import { MetadataReadability } from 'twenty-shared/types';

// SYSTEM and APPLICATION lock records away from workspace users, so only
// applications may set them through their manifest
export const UPDATABLE_OBJECT_READABILITIES = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
  MetadataReadability.INHERITED,
] as const;
