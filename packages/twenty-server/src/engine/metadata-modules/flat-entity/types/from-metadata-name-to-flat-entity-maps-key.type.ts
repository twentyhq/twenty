import { AllFlatEntityConfigurationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';

export type FromMetadataNameToFlatEntityMapsKey<
  P extends keyof AllFlatEntityConfigurationByMetadataName,
> = `flat${Capitalize<P>}Maps`;
