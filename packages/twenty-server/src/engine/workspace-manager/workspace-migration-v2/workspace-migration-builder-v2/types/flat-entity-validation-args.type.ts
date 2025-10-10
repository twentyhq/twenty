import {
  type MetadataFlatEntity,
  type MetadataFlatEntityMaps,
  type MetadataRelatedFlatEntityMaps,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type FlatEntityValidationArgs<T extends AllMetadataName> = {
  flatEntityToValidate: MetadataFlatEntity<T>;
  optimisticFlatEntityMaps: MetadataFlatEntityMaps<T>;
  dependencyOptimisticFlatEntityMaps: MetadataRelatedFlatEntityMaps<T>;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: MetadataFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
