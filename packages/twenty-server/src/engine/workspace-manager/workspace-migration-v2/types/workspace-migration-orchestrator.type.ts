import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type WorkspaceMigrationActionType,
  type MetadataWorkspaceMigrationActionsRecord,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type FromToAllFlatEntityMaps = {
  [P in keyof AllFlatEntityMaps]?: FromTo<AllFlatEntityMaps[P]>;
};

export type WorkspaceMigrationOrchestratorBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationBuilderOptions;
  fromToAllFlatEntityMaps: FromToAllFlatEntityMaps;
  dependencyAllFlatEntityMaps?: Partial<AllFlatEntityMaps>;
  additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
};

export type OrchestratorFailureReport = {
  [P in AllMetadataName]: FailedFlatEntityValidation<
    P,
    WorkspaceMigrationActionType
  >[];
};

export type OrchestratorActionsReport = {
  [P in AllMetadataName]: MetadataWorkspaceMigrationActionsRecord<P>;
};

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  report: OrchestratorFailureReport;
};

export type WorkspaceMigrationOrchestratorSuccessfulResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
};
