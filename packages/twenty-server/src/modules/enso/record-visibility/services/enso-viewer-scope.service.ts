import { Injectable } from '@nestjs/common';

import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getEnsoScopedRoleIds } from 'src/modules/enso/record-visibility/utils/get-enso-scoped-role-ids.util';

// Answers the one question several features need: is the person making this
// request limited to the records they own? Both the lead lookup and the sidebar
// trim key off it, so it lives here rather than being duplicated.
@Injectable()
export class EnsoViewerScopeService {
  constructor(private readonly userRoleService: UserRoleService) {}

  async isViewerScoped({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<boolean> {
    const scopedRoleIds = getEnsoScopedRoleIds();

    if (scopedRoleIds.size === 0 || !userWorkspaceId) {
      return false;
    }

    try {
      const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
        workspaceId,
        userWorkspaceId,
      });

      return scopedRoleIds.has(roleId);
    } catch {
      // No role resolved means no scoped role. Neither caller is a good place
      // to surface a permissions misconfiguration.
      return false;
    }
  }
}
