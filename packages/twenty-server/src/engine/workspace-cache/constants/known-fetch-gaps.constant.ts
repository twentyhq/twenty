import { type AllMetadataName } from 'twenty-shared/metadata';

// Documented divergences between the relation constants and what the flat
// providers actually fetch. Each entry is a pre-existing behavior, not an
// accident: the corresponding aggregator arrays are built empty. Declaring
// the fetch would silently start populating them; do it deliberately, then
// delete the entry here. Feeds both the compile-time requirement carve-out
// (FlatEntityFetchShape) and the runtime drift spec.
export const KNOWN_FETCH_GAPS = {
  objectMetadata: ['fieldPermission'],
  fieldMetadata: ['fieldPermission'],
} as const satisfies Partial<Record<AllMetadataName, readonly AllMetadataName[]>>;
