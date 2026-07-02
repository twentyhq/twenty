import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-side-effect-companion-metadata-names.constant';
import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

export type MetadataSideEffectCompanionMetadataNames<
  T extends AllMetadataName,
> = T extends keyof typeof ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES
  ? (typeof ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES)[T][number]
  : never;

export type MetadataSideEffectRelatedMetadataNames<T extends AllMetadataName> =
  | MetadataManyToOneRelatedMetadataNames<T>
  | MetadataSideEffectCompanionMetadataNames<T>;
