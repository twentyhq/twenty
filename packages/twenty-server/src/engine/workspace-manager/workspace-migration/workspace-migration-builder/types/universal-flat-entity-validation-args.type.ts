import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export type UniversalFlatEntityValidationArgs<T extends AllMetadataName> = {
  additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
  flatEntityToValidate: MetadataUniversalFlatEntity<T>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<T>;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: MetadataUniversalFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
