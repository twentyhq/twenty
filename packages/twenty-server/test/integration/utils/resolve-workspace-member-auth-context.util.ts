import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';

export const resolveWorkspaceMemberAuthContext = ({
  workspaceId,
  workspaceMemberId,
}: {
  workspaceId: string;
  workspaceMemberId: string;
}) =>
  getAppProviderByClassName<UserWorkspaceAuthContextService>(
    'UserWorkspaceAuthContextService',
  ).resolveWorkspaceMember({ workspaceId, workspaceMemberId });
