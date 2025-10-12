import { type ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import { type MetadataValidationRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type FromMetadataNameToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-name-to-flat-entity-maps-key.type';

export type MetadataFlatEntityMapsKey<T extends AllMetadataName> =
  FromMetadataNameToFlatEntityMapsKey<T>;

export type MetadataRelatedMetadataNames<T extends AllMetadataName> = Extract<
  keyof (typeof ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS)[T],
  AllMetadataName
>;

export type MetadataRelatedFlatEntityMapsKeys<T extends AllMetadataName> =
  FromMetadataNameToFlatEntityMapsKey<MetadataRelatedMetadataNames<T>>;

export type MetadataFlatEntityAndRelatedFlatEntityMaps<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T> | MetadataFlatEntityMapsKey<T>
>;

export type MetadataValidationRelatedFlatEntityMaps<T extends AllMetadataName> =
  MetadataValidationRelatedMetadataNames<T> extends undefined
    ? undefined
    : Pick<
        AllFlatEntityMaps,
        FromMetadataNameToFlatEntityMapsKey<
          NonNullable<MetadataValidationRelatedMetadataNames<T>>
        >
      >;

