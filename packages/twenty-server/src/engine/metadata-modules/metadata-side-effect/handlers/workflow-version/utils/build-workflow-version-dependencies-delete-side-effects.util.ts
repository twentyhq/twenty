import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowVersionDependenciesDeleteOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/build-workflow-version-dependencies-delete-operations.util';
import { getWorkflowIdsDeletedInMigration } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/get-workflow-ids-deleted-in-migration.util';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionDependenciesDeleteSideEffects = ({
  flatEntity,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps: {
    flatWorkflowMaps,
    flatWorkflowVersionMaps,
    flatCommandMenuItemMaps,
    flatLogicFunctionMaps,
  },
}: BuildSideEffectsArgs<'workflowVersion'>): MetadataSideEffectResult => {
  const deletedWorkflowVersion =
    flatWorkflowVersionMaps.byUniversalIdentifier[
      flatEntity.universalIdentifier
    ];

  if (
    !isDefined(deletedWorkflowVersion) ||
    (isDefined(deletedWorkflowVersion.coreWorkflowId) &&
      getWorkflowIdsDeletedInMigration({
        allFlatEntityOperationRecordByMetadataName,
        flatWorkflowMaps,
      }).has(deletedWorkflowVersion.coreWorkflowId))
  ) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: buildWorkflowVersionDependenciesDeleteOperations({
      deletedWorkflowVersions: [deletedWorkflowVersion],
      allFlatEntityOperationRecordByMetadataName,
      flatWorkflowMaps,
      flatWorkflowVersionMaps,
      flatCommandMenuItemMaps,
      flatLogicFunctionMaps,
    }),
  };
};
