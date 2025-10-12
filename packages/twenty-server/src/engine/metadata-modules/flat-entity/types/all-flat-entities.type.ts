import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';

export type AllFlatEntities =
  AllFlatEntityTypesByMetadataName[keyof AllFlatEntityTypesByMetadataName]['flatEntity'];
