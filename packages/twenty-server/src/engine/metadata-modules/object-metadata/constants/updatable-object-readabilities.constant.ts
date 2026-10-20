import { MetadataReadability } from 'twenty-shared/types';

// SYSTEM and APPLICATION lock records away from workspace users, so they stay manifest-only
export const UPDATABLE_OBJECT_READABILITIES = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
  MetadataReadability.INHERITED,
] as const;
