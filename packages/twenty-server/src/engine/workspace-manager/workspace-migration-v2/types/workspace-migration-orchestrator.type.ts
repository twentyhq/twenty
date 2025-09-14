import { type FromTo } from 'twenty-shared/types';

import { AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type WorkspaceMigrationOrchestratorBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  fromToAllFlatEntityMaps: {
    [P in keyof AllFlatEntityMaps]?: FromTo<AllFlatEntityMaps[P]>;
  };
  dependencyAllFlatEntityMaps?: Partial<AllFlatEntityMaps>;
};

export type OrchestratorFailureReport = {
  [P in keyof AllFlatEntities]: FailedFlatEntityValidation<
    AllFlatEntities[P]
  >[];
};

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  report: OrchestratorFailureReport;
};

export type WorkspaceMigrationOrchestratorSuccessfulResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
};
