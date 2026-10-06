import { getWorkflowVersionUniversalIdentifier } from 'twenty-shared/application';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { getExclusivelyOwnedAiAgentStepAgentIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-ai-agent-step-agent-ids.util';
import { getExclusivelyOwnedCodeStepLogicFunctionIds } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-exclusively-owned-code-step-logic-function-ids.util';
import { getOwnedAgentDeletions } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/get-owned-agent-deletions.util';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export const buildWorkflowVersionDeleteSideEffects = ({
  flatEntity,
  relatedFlatEntityMaps: {
    flatWorkflowMaps,
    flatWorkflowVersionMaps,
    flatCommandMenuItemMaps,
    flatLogicFunctionMaps,
    flatAgentMaps,
    flatRoleTargetMaps,
    flatRoleMaps,
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

  const remainingWorkflowVersions = workflowVersions.filter(
    (workflowVersion) => !isDeletedWorkflowVersion(workflowVersion),
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

  const deletedAgents = getOwnedAgentDeletions({
    agentIds: getExclusivelyOwnedAiAgentStepAgentIds({
      deletedWorkflowVersions,
      remainingWorkflowVersions,
    }),
    flatAgents: Object.values(flatAgentMaps.byUniversalIdentifier).filter(
      isDefined,
    ),
    flatRoleTargets: Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    ).filter(isDefined),
    flatRoles: Object.values(flatRoleMaps.byUniversalIdentifier).filter(
      isDefined,
    ),
  });

  return {
    status: 'success',
    operations: {
      workflowVersion: {
        flatEntityToDelete: fromArrayToUniqueKeyRecord({
          array: deletedWorkflowVersions,
          uniqueKey: 'universalIdentifier',
        }),
      },
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
      agent: {
        flatEntityToDelete: fromArrayToUniqueKeyRecord({
          array: deletedAgents.agents,
          uniqueKey: 'universalIdentifier',
        }),
      },
      roleTarget: {
        flatEntityToDelete: fromArrayToUniqueKeyRecord({
          array: deletedAgents.roleTargets,
          uniqueKey: 'universalIdentifier',
        }),
      },
      role: {
        flatEntityToDelete: fromArrayToUniqueKeyRecord({
          array: deletedAgents.roles,
          uniqueKey: 'universalIdentifier',
        }),
      },
    },
  };
};
