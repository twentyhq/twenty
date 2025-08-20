import { isDefined } from 'twenty-shared/utils';

import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { getPathsFromStepHttpRequestIfBodyTypeFormData } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/getPathsFromStepHttpRequestIfBodyTypeFormData';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getAllPathsToDelete = (
  paths: string[],
  workflowVersions: WorkflowVersionWorkspaceEntity[],
  stepId: string,
) => {
  const allSteps = workflowVersions.flatMap(
    (workflowVersion) => workflowVersion.steps,
  );

  const pathsInUse = new Set<string>();

  for (const step of allSteps) {
    if (step?.id === stepId) continue;
    if (step?.type !== WorkflowActionType.HTTP_REQUEST) continue;
    const paths = getPathsFromStepHttpRequestIfBodyTypeFormData(
      step.settings?.input,
    );

    if (isDefined(paths) && paths.length > 0) {
      paths.forEach((path) => pathsInUse.add(path));
    }
  }

  return paths.filter((path) => !pathsInUse.has(path));
};
