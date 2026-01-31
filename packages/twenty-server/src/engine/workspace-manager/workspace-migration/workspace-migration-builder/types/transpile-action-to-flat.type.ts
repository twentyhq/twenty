import { FromUniversalFlatEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-universal-flat-entity-to-metadata-name.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { AllMetadataName } from 'twenty-shared/metadata';

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
