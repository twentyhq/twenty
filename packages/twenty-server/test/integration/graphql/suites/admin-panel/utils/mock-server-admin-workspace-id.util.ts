import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';

export const mockServerAdminWorkspaceId = (
  serverAdminWorkspaceId: string | undefined,
) => {
  mockConfigVariables({ SERVER_ADMIN_WORKSPACE_ID: serverAdminWorkspaceId });
};
