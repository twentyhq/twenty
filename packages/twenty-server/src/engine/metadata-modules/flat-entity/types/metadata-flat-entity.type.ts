import { type AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-configuration-by-metadata-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataFlatEntity<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['flatEntity'];

export type MetadataEntity<T extends AllMetadataName> =
  AllFlatEntityConfigurationByMetadataName[T]['entity'];

