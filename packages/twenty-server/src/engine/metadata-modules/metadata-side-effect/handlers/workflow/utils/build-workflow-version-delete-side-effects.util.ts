import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { buildWorkflowVersionDependenciesDeleteOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/build-workflow-version-dependencies-delete-operations.util';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionDeleteSideEffects = ({
  flatEntity,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps: {
    flatWorkflowMaps,
    flatWorkflowVersionMaps,
    flatCommandMenuItemMaps,
    flatLogicFunctionMaps,
  },
}: BuildSideEffectsArgs<'workflow'>): MetadataSideEffectResult => {
  const managedVersionUniversalIdentifier =
    getWorkflowVersionUniversalIdentifier({
      applicationUniversalIdentifier: flatEntity.applicationUniversalIdentifier,
      workflowUniversalIdentifier: flatEntity.universalIdentifier,
    });
  const workflowId =
    flatWorkflowMaps.byUniversalIdentifier[flatEntity.universalIdentifier]?.id;

  const workflowVersions = Object.values(
    flatWorkflowVersionMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const isDeletedWorkflowVersion = (workflowVersion: FlatWorkflowVersion) =>
    (workflowVersion.universalIdentifier ===
      managedVersionUniversalIdentifier &&
      workflowVersion.isSystemSideEffect) ||
    (isDefined(workflowId) && workflowVersion.coreWorkflowId === workflowId);

  const deletedWorkflowVersions = workflowVersions.filter(
    isDeletedWorkflowVersion,
  );

  if (deletedWorkflowVersions.length === 0) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: {
      workflowVersion: {
        flatEntityToDelete: fromArrayToUniqueKeyRecord({
          array: deletedWorkflowVersions,
          uniqueKey: 'universalIdentifier',
        }),
      },
      ...buildWorkflowVersionDependenciesDeleteOperations({
        deletedWorkflowVersions,
        allFlatEntityOperationRecordByMetadataName,
        flatWorkflowMaps,
        flatWorkflowVersionMaps,
        flatCommandMenuItemMaps,
        flatLogicFunctionMaps,
      }),
    },
  };
};
