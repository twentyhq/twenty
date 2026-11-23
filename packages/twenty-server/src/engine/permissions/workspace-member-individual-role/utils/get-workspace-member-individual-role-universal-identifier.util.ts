import { v5 } from 'uuid';

import {
  API_KEYS_INDIVIDUAL_ROLE_HOLDER_NAME,
  WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
} from 'src/engine/permissions/workspace-member-individual-role/constants/workspace-member-individual-role.constant';
import { type WorkspaceMemberIndividualRoleHolder } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';

export const getWorkspaceMemberIndividualRoleUniversalIdentifier = ({
  holder,
}: {
  holder: WorkspaceMemberIndividualRoleHolder;
}): string =>
  v5(
    holder.type === 'apiKeys'
      ? [
          API_KEYS_INDIVIDUAL_ROLE_HOLDER_NAME,
          ...Object.entries(holder.writeGrants)
            .filter(([, isGranted]) => isGranted)
            .map(([grant]) => grant)
            .sort(),
        ].join(':')
      : holder.userWorkspaceId,
    WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
  );
