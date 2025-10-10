import { AllFlatEntitiesByMetadataEngineNameV2 } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';

export type FromMetadataEngineNameToFlatEntityMapsKey<
  P extends keyof AllFlatEntitiesByMetadataEngineNameV2,
> = `flat${Capitalize<P>}Maps`;
