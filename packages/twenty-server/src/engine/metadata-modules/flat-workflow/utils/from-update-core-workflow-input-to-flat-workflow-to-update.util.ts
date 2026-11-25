import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

export const fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate = ({
  existingFlatWorkflow,
  name,
  isPrivate,
  userWorkspaceId,
}: {
  existingFlatWorkflow: FlatWorkflow;
  name?: string;
  isPrivate?: boolean;
  userWorkspaceId: string | undefined;
}): FlatWorkflow => {
  const flatWorkflowToUpdate: FlatWorkflow = {
    ...existingFlatWorkflow,
    ...(isDefined(name) ? { name } : {}),
  };

  if (!isDefined(isPrivate)) {
    return flatWorkflowToUpdate;
  }

  return {
    ...flatWorkflowToUpdate,
    isPrivate,
    createdByUserWorkspaceId:
      userWorkspaceId ?? existingFlatWorkflow.createdByUserWorkspaceId,
  };
};
