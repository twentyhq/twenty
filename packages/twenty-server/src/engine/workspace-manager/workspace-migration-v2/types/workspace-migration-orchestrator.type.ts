import { type FromTo } from 'twenty-shared/types';

import { type FailedFlatViewFieldValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-field-validation.type';
import { type FailedFlatViewValidation } from 'src/engine/core-modules/view/flat-view/types/failed-flat-view-validation.type';
import { type FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { type FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';

export type WorkspaceMigrationOrchestratorEntityMaps = {
  object?: FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>;
  field?: FromTo<FlatObjectMetadataMaps, 'FlatObjectMetadataMaps'>; // Fields are part of object maps for now
  view?: FromTo<FlatViewMaps, 'FlatViewMaps'>;
  viewField?: FromTo<FlatViewFieldMaps, 'FlatViewFieldMaps'>;
};

type UnwrapFromTo<T> = T extends FromTo<infer U, infer _Tag> ? U : T;

export type WorkspaceMigrationOrchestratorOptimisticEntityMaps = {
  [K in keyof WorkspaceMigrationOrchestratorEntityMaps]?: UnwrapFromTo<
    WorkspaceMigrationOrchestratorEntityMaps[K]
  >;
};

export type WorkspaceMigrationOrchestratorBuildArgs = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  entityMaps: WorkspaceMigrationOrchestratorEntityMaps;
};

export type WorkspaceMigrationOrchestratorFailedResult = {
  status: 'fail';
  errors: (
    | FailedFlatObjectMetadataValidation
    | FailedFlatFieldMetadataValidation
    | FailedFlatViewValidation
    | FailedFlatViewFieldValidation
  )[];
};
