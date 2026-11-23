import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow = ({
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

  if (!isDefined(userWorkspaceId)) {
    throw new WorkflowQueryValidationException(
      `Core workflow '${existingFlatWorkflow.id}' can only have its visibility changed by a workspace member`,
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        userFriendlyMessage: msg`Only a workspace member can change who sees a workflow`,
      },
    );
  }

  return {
    ...flatWorkflowToUpdate,
    isPrivate,
    createdByUserWorkspaceId: userWorkspaceId,
  };
};
