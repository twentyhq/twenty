import { Arrayable, type FromTo } from 'twenty-shared/types';

import {
  MetadataFlatEntity,
  MetadataWorkspaceMigrationActionsRecord,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  [P in AllMetadataName]: FailedFlatEntityValidation<MetadataFlatEntity<P>>[];
};

export type OrchestratorActionsReport = {
  [P in AllMetadataName]: Arrayable<MetadataWorkspaceMigrationActionsRecord<P>>;
};

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  report: OrchestratorFailureReport;
};

export type WorkspaceMigrationOrchestratorSuccessfulResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
};
