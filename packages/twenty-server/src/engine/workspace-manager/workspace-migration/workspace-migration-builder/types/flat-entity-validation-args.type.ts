import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export type FlatEntityValidationArgs<T extends AllMetadataName> = {
  additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
  flatEntityToValidate: MetadataFlatEntity<T>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForValidation<T>;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: MetadataFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
