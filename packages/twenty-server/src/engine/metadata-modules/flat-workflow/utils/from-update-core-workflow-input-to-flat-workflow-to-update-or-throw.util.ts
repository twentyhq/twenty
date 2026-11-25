import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';
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

  if (
    !canCallerChangePrivatableEntityPrivacy({
      privatableEntity: existingFlatWorkflow,
    })
  ) {
    throw new WorkflowQueryValidationException(
      `Core workflow '${existingFlatWorkflow.id}' can only have its visibility changed by its creator`,
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        userFriendlyMessage: msg`Only the person who created this workflow can change who sees it`,
      },
    );
  }

  return {
    ...flatWorkflowToUpdate,
    isPrivate,
    createdByUserWorkspaceId:
      userWorkspaceId ?? existingFlatWorkflow.createdByUserWorkspaceId,
  };
};
