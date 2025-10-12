import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type FromMetadataNameToFlatEntityMapsKey<
  T extends AllMetadataName,
> =   T extends AllMetadataName 
    ? `flat${Capitalize<T>}Maps`
    : never;
