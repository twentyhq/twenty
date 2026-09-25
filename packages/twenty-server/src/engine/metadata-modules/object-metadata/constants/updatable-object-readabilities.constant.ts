import { MetadataReadability } from 'twenty-shared/types';

// SYSTEM and APPLICATION lock records away from workspace users, and INHERITED
// needs parent fields this API cannot set yet, so those stay manifest-only
export const UPDATABLE_OBJECT_READABILITIES = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
] as const;
