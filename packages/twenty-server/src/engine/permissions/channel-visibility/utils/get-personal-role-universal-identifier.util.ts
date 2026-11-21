import { v5 } from 'uuid';

import { PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';

export const getPersonalRoleUniversalIdentifier = (
  userWorkspaceId: string,
): string => v5(userWorkspaceId, PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE);
