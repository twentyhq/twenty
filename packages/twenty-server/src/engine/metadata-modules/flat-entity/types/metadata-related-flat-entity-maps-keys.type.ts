import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';

export type MetadataRelatedFlatEntityMapsKeys<T extends AllMetadataName> =
  MetadataToFlatEntityMapsKey<MetadataManyToOneRelatedMetadataNames<T>>;
