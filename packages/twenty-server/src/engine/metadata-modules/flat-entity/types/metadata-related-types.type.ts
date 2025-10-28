import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type MetadataValidationRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-validation-related-metadata-names.type';

export type MetadataFlatEntityAndRelatedFlatEntityMaps<
  T extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  MetadataRelatedFlatEntityMapsKeys<T> | MetadataToFlatEntityMapsKey<T>
>;

export type MetadataValidationRelatedFlatEntityMaps<T extends AllMetadataName> =
  MetadataValidationRelatedMetadataNames<T> extends undefined
    ? undefined
    : Pick<
        AllFlatEntityMaps,
        MetadataToFlatEntityMapsKey<
          NonNullable<MetadataValidationRelatedMetadataNames<T>>
        >
      >;
