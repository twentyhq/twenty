import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type MetadataUniversalFlatEntityMaps<T extends AllMetadataName> =
  UniversalFlatEntityMaps<
    AllFlatEntityTypesByMetadataName[T]['universalFlatEntity']
  >;
