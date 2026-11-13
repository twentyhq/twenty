import { msg } from '@lingui/core/macro';
import { type WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow = ({
  existingFlatWorkflow,
  name,
  visibility,
  userWorkspaceId,
}: {
  existingFlatWorkflow: FlatWorkflow;
  name?: string;
  visibility?: WorkflowVisibility;
  userWorkspaceId: string | undefined;
}): FlatWorkflow => {
  const flatWorkflowToUpdate: FlatWorkflow = {
    ...existingFlatWorkflow,
    ...(isDefined(name) ? { name } : {}),
  };

  if (!isDefined(visibility)) {
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
    visibility,
    createdByUserWorkspaceId: userWorkspaceId,
  };
};
