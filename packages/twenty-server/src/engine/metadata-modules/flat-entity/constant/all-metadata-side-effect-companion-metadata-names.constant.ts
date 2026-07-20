import { type AllMetadataName } from 'twenty-shared/metadata';

export const ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES = {
  fieldMetadata: ['index', 'searchFieldMetadata'],
  objectMetadata: ['fieldMetadata', 'index', 'searchFieldMetadata'],
} as const satisfies Partial<
  Record<AllMetadataName, readonly AllMetadataName[]>
>;
