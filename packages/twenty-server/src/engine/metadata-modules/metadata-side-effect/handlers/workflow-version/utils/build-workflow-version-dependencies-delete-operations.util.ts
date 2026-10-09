import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { getWorkflowIdsDeletedInMigration } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/get-workflow-ids-deleted-in-migration.util';
import { getExclusivelyOwnedCodeStepLogicFunctionIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-code-step-logic-function-ids.util';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';

export const buildWorkflowVersionDependenciesDeleteOperations = ({
  deletedWorkflowVersions,
  allFlatEntityOperationRecordByMetadataName,
  flatWorkflowMaps,
  flatWorkflowVersionMaps,
  flatCommandMenuItemMaps,
  flatLogicFunctionMaps,
}: {
  deletedWorkflowVersions: FlatWorkflowVersion[];
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
} & Pick<
  AllFlatEntityMaps,
  | 'flatWorkflowMaps'
  | 'flatWorkflowVersionMaps'
  | 'flatCommandMenuItemMaps'
  | 'flatLogicFunctionMaps'
>): Pick<
  MetadataSideEffectOperationsByMetadataName,
  'commandMenuItem' | 'logicFunction'
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

  const workflowVersionUniversalIdentifiersDeletedInMigration = new Set(
    Object.keys(
      allFlatEntityOperationRecordByMetadataName.workflowVersion
        ?.flatEntityToDelete ?? {},
    ),
  );
  const workflowIdsDeletedInMigration = getWorkflowIdsDeletedInMigration({
    allFlatEntityOperationRecordByMetadataName,
    flatWorkflowMaps,
  });

  const remainingWorkflowVersions = Object.values(
    flatWorkflowVersionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      ({ id, universalIdentifier, coreWorkflowId }) =>
        !deletedCoreVersionIds.has(id) &&
        !workflowVersionUniversalIdentifiersDeletedInMigration.has(
          universalIdentifier,
        ) &&
        !(
          isDefined(coreWorkflowId) &&
          workflowIdsDeletedInMigration.has(coreWorkflowId)
        ),
    );

  const deletedLogicFunctionIds = new Set(
    getExclusivelyOwnedCodeStepLogicFunctionIds({
      deletedWorkflowVersions,
      remainingWorkflowVersions,
    }),
  );
  const deletedLogicFunctions = Object.values(
    flatLogicFunctionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(({ id }) => deletedLogicFunctionIds.has(id));

  return {
    commandMenuItem: {
      flatEntityToDelete: fromArrayToUniqueKeyRecord({
        array: deletedCommandMenuItems,
        uniqueKey: 'universalIdentifier',
      }),
    },
    logicFunction: {
      flatEntityToDelete: fromArrayToUniqueKeyRecord({
        array: deletedLogicFunctions,
        uniqueKey: 'universalIdentifier',
      }),
    },
  };
};
