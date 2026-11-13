import { isNonEmptyString, isString } from '@sniptt/guards';
import { WorkflowVisibility } from 'twenty-shared/types';

import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';

export const resolveWorkflowPrivacyState = (
  workflow: OwnableRootRow,
): OwnableRootPrivacyState => ({
  isPrivate:
    !isString(workflow.visibility) ||
    workflow.visibility !== WorkflowVisibility.WORKSPACE,
  ownerUserWorkspaceId: isNonEmptyString(workflow.createdByUserWorkspaceId)
    ? workflow.createdByUserWorkspaceId
    : null,
});
