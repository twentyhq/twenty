import { type AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-configuration-by-metadata-name.type';

export type AllFlatEntities =
  AllFlatEntityConfigurationByMetadataName[keyof AllFlatEntityConfigurationByMetadataName]['flatEntity'];
