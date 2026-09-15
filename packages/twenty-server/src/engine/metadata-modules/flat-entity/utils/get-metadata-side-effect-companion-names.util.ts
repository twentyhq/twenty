import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-side-effect-companion-metadata-names.constant';
import { type MetadataSideEffectCompanionMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-side-effect-related-metadata-names.type';

export const getMetadataSideEffectCompanionNames = <T extends AllMetadataName>(
  metadataName: T,
): MetadataSideEffectCompanionMetadataNames<T>[] => {
  const companionMetadataNamesByMetadataName =
    ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES as Partial<
      Record<AllMetadataName, readonly AllMetadataName[]>
    >;

  return (companionMetadataNamesByMetadataName[metadataName] ??
    []) as MetadataSideEffectCompanionMetadataNames<T>[];
};
