import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type ChangedApplicationWorkflowDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/changed-application-workflow-dependencies.type';
import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';

export const findChangedApplicationWorkflowDependencies = ({
  fromAllFlatEntityMaps,
  flatEntityOperationRecordByMetadataName,
  shouldBlockLogicFunctionUpdates,
}: {
  fromAllFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatWorkflowMaps' | 'flatLogicFunctionMaps' | 'flatAgentMaps'
  >;
  flatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  shouldBlockLogicFunctionUpdates: boolean;
}): ChangedApplicationWorkflowDependencies => {
  const { workflow, logicFunction, agent } =
    flatEntityOperationRecordByMetadataName;

  const removedWorkflowIds = new Set(
    Object.keys(workflow?.flatEntityToDelete ?? {})
      .map(
        (universalIdentifier) =>
          fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier[
            universalIdentifier
          ]?.id,
      )
      .filter(isDefined),
  );

  const changedLogicFunctionDescriptionById = new Map<string, string>();

  for (const universalIdentifier of Object.keys(
    logicFunction?.flatEntityToDelete ?? {},
  )) {
    const existingLogicFunction =
      fromAllFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    if (isDefined(existingLogicFunction)) {
      changedLogicFunctionDescriptionById.set(
        existingLogicFunction.id,
        `logic function "${existingLogicFunction.name}", which this update removes`,
      );
    }
  }

  for (const [universalIdentifier, updatedLogicFunction] of Object.entries(
    shouldBlockLogicFunctionUpdates
      ? (logicFunction?.flatEntityToUpdate ?? {})
      : {},
  )) {
    const existingLogicFunction =
      fromAllFlatEntityMaps.flatLogicFunctionMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    if (
      isDefined(existingLogicFunction) &&
      isDefined(updatedLogicFunction) &&
      computeLogicFunctionExecutionFingerprint(existingLogicFunction) !==
        computeLogicFunctionExecutionFingerprint(updatedLogicFunction)
    ) {
      changedLogicFunctionDescriptionById.set(
        existingLogicFunction.id,
        `logic function "${existingLogicFunction.name}", which this update changes`,
      );
    }
  }

  const changedAgentDescriptionById = new Map<string, string>();

  for (const universalIdentifier of Object.keys(
    agent?.flatEntityToDelete ?? {},
  )) {
    const existingAgent =
      fromAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    if (isDefined(existingAgent)) {
      changedAgentDescriptionById.set(
        existingAgent.id,
        `agent "${existingAgent.label}", which this update removes`,
      );
    }
  }

  for (const [universalIdentifier, updatedAgent] of Object.entries(
    agent?.flatEntityToUpdate ?? {},
  )) {
    const existingAgent =
      fromAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    if (
      isDefined(existingAgent) &&
      isDefined(updatedAgent) &&
      computeAgentExecutionFingerprint(existingAgent) !==
        computeAgentExecutionFingerprint(updatedAgent)
    ) {
      changedAgentDescriptionById.set(
        existingAgent.id,
        `agent "${existingAgent.label}", which this update changes`,
      );
    }
  }

  return {
    removedWorkflowIds,
    changedLogicFunctionDescriptionById,
    changedAgentDescriptionById,
  };
};
