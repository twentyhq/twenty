import { isNonEmptyString, isString } from '@sniptt/guards';
import { WorkflowVisibility } from 'twenty-shared/types';

import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';

type WorkflowPrivacyRow = {
  visibility?: unknown;
  createdByUserWorkspaceId?: unknown;
};

export const resolveWorkflowPrivacyState = (
  workflow: WorkflowPrivacyRow,
): OwnableRootPrivacyState => ({
  isPrivate:
    !isString(workflow.visibility) ||
    workflow.visibility !== WorkflowVisibility.WORKSPACE,
  ownerUserWorkspaceId: isNonEmptyString(workflow.createdByUserWorkspaceId)
    ? workflow.createdByUserWorkspaceId
    : null,
});
