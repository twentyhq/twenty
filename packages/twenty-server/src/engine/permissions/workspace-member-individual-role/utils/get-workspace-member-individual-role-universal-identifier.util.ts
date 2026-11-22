import { v5 } from 'uuid';

import { WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE } from 'src/engine/permissions/workspace-member-individual-role/constants/workspace-member-individual-role.constant';

export const getWorkspaceMemberIndividualRoleUniversalIdentifier = (
  userWorkspaceId: string,
): string =>
  v5(
    userWorkspaceId,
    WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
  );
