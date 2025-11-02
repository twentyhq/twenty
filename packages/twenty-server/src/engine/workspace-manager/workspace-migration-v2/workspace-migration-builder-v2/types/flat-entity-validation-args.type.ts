import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataValidationRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type FlatEntityValidationArgs<T extends AllMetadataName> = {
  flatEntityToValidate: MetadataFlatEntity<T>;
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  mutableDependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: MetadataFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
