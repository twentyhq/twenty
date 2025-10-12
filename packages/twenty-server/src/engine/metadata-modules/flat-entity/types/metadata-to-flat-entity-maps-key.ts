import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type MetadataToFlatEntityMapsKey<T extends AllMetadataName> =
  T extends AllMetadataName ? `flat${Capitalize<T>}Maps` : never;
