import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';

export const buildWorkflowVersionDependenciesDeleteOperations = ({
  deletedWorkflowVersions,
  flatCommandMenuItemMaps,
}: {
  deletedWorkflowVersions: FlatWorkflowVersion[];
} & Pick<AllFlatEntityMaps, 'flatCommandMenuItemMaps'>): Pick<
  MetadataSideEffectOperationsByMetadataName,
  'commandMenuItem'
> => {
  const deletedCoreVersionIds = new Set(
    deletedWorkflowVersions.map(({ id }) => id),
  );
  const deletedWorkspaceVersionIds = new Set(
    deletedWorkflowVersions
      .map(({ workspaceWorkflowVersionId }) => workspaceWorkflowVersionId)
      .filter(isDefined),
  );

  const deletedCommandMenuItems = Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      ({ coreWorkflowVersionId, workflowVersionId }) =>
        (isDefined(coreWorkflowVersionId) &&
          deletedCoreVersionIds.has(coreWorkflowVersionId)) ||
        (isDefined(workflowVersionId) &&
          deletedWorkspaceVersionIds.has(workflowVersionId)),
    );

  return {
    commandMenuItem: {
      flatEntityToDelete: fromArrayToUniqueKeyRecord({
        array: deletedCommandMenuItems,
        uniqueKey: 'universalIdentifier',
      }),
    },
  };
};
