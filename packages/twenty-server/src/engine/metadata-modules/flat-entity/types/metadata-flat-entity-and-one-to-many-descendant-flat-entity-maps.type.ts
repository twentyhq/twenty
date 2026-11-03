import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataOneToManyRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-one-to-many-related-metadata-names.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';

type MetadataAndOneToManyDescendantMetadataNames<
  TMetadataName extends AllMetadataName,
  TVisitedMetadataName extends AllMetadataName = never,
> = TMetadataName extends TVisitedMetadataName
  ? never
  :
      | TMetadataName
      | MetadataAndOneToManyDescendantMetadataNames<
          MetadataOneToManyRelatedMetadataNames<TMetadataName>,
          TVisitedMetadataName | TMetadataName
        >;

export type MetadataFlatEntityAndOneToManyDescendantFlatEntityMaps<
  TMetadataName extends AllMetadataName,
> = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    MetadataAndOneToManyDescendantMetadataNames<TMetadataName>
  >
>;
