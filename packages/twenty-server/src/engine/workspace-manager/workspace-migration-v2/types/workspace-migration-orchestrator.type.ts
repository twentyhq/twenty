import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type CreatedDeletedUpdatedActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type WorkspaceMigrationOrchestratorBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationBuilderOptions;
  fromToAllFlatEntityMaps: {
    [P in keyof AllFlatEntityMaps]?: FromTo<AllFlatEntityMaps[P]>;
  };
  dependencyAllFlatEntityMaps?: Partial<AllFlatEntityMaps>;
};

export type OrchestratorFailureReport = {
  [P in keyof AllFlatEntitiesByMetadataEngineName]: FailedFlatEntityValidation<
    AllFlatEntitiesByMetadataEngineName[P]
  >[];
};

export type OrchestratorActionsReport = {
  // TODO could improve this typing but making generic actions and using extract
  [P in keyof AllFlatEntitiesByMetadataEngineName]: CreatedDeletedUpdatedActions<WorkspaceMigrationActionV2>;
} & {
  fieldMetadata: CreatedDeletedUpdatedActions<WorkspaceMigrationActionV2>;
};

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  report: OrchestratorFailureReport;
};

export type WorkspaceMigrationOrchestratorSuccessfulResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
};
