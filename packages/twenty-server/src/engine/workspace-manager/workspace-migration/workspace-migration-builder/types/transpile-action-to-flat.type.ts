import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FromUniversalFlatEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-universal-flat-entity-to-metadata-name.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

type TranspileToFlat<T> = T extends readonly (infer U)[]
  ? U extends MetadataUniversalFlatEntity<AllMetadataName>
    ? MetadataFlatEntity<FromUniversalFlatEntityToMetadataName<U>>[]
    : T
  : T extends MetadataUniversalFlatEntity<AllMetadataName>
    ? MetadataFlatEntity<FromUniversalFlatEntityToMetadataName<T>>
    : T;

export type TranspileActionUniversalToFlat<TAction> = {
  [P in keyof TAction]: TranspileToFlat<TAction[P]>;
};
