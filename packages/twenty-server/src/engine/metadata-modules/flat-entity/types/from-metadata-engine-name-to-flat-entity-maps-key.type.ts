import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';

export type FromMetadataEngineNameToFlatEntityMapsKey<
  P extends keyof AllFlatEntitiesByMetadataEngineName,
> = `flat${Capitalize<P>}Maps`;
