import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

// Context handed to every side-effect handler. It exposes the current workspace state
// (so handlers can dedupe companions against entities that already exist) plus the
// dependency/build context handlers may need to resolve foreign keys or branch on the
// build options. The operation matrix being expanded is passed separately.
export type MetadataSideEffectContext = {
  existingAllFlatEntityMaps?: Partial<AllFlatEntityMaps>;
  dependencyAllFlatEntityMaps?: Partial<AllUniversalFlatEntityMaps>;
  additionalCacheDataMaps?: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
  buildOptions: WorkspaceMigrationBuilderOptions;
};
