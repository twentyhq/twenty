import { type AllMetadataName } from 'twenty-shared/metadata';

// A side-effect handler's parent maps are already inferable from
// ALL_MANY_TO_ONE_METADATA_RELATIONS (e.g. fieldMetadata -> objectMetadata), so
// they are NOT repeated here. This registry only declares the *companion*
// metadata a trigger's handlers create/read as a side effect and that is not a
// schema relation of the trigger (e.g. field unique handlers manage the backing
// `index`, but a field has no foreign key to an index). Only triggers that have
// handlers need an entry.
export const ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES = {
  fieldMetadata: ['index'],
} as const satisfies Partial<Record<AllMetadataName, readonly AllMetadataName[]>>;
