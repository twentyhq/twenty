import { isDefined } from 'twenty-shared/utils';

import { type WorkflowExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-execution-dependencies.type';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';

const hasFingerprintChanged = (
  currentFingerprint: string | undefined,
  pinnedFingerprint: string | undefined,
) => !isDefined(currentFingerprint) || currentFingerprint !== pinnedFingerprint;

export const hasPinnedDependencyChanged = ({
  dependencies,
  pinnedDependencies,
  currentDependencies,
}: {
  dependencies: WorkflowExecutionDependencies;
  pinnedDependencies: WorkflowRunPinnedDependencies;
  currentDependencies: WorkflowRunPinnedDependencies;
}): boolean =>
  dependencies.logicFunctionIds.some((logicFunctionId) =>
    hasFingerprintChanged(
      currentDependencies.logicFunctionFingerprintById[logicFunctionId],
      pinnedDependencies.logicFunctionFingerprintById[logicFunctionId],
    ),
  ) ||
  dependencies.agentIds.some((agentId) =>
    hasFingerprintChanged(
      currentDependencies.agentFingerprintById[agentId],
      pinnedDependencies.agentFingerprintById[agentId],
    ),
  );
