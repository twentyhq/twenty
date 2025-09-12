import { type FromTo } from 'twenty-shared/types';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';

export type WorkspaceMigrationOrchestratorBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
} & FromTo<AllFlatEntityMaps, 'allFlatEntityMaps'>;

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  errors: FailedFlatEntityValidation<FlatEntity>[];
};
