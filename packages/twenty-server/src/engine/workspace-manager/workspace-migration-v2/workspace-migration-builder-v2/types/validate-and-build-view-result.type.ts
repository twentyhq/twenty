import { type FailedFlatViewValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation.type';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type ValidateAndBuildViewResult<T extends WorkspaceMigrationActionV2> = {
  failed: FailedFlatViewValidation[];
  created: T[];
  deleted: T[];
  updated: T[];
  optimisticFlatViewMaps: FlatViewMaps;
};
