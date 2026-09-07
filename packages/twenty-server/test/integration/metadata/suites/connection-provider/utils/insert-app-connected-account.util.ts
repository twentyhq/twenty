import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const insertAppConnectedAccount = async ({
  id,
  userWorkspaceId,
  applicationId,
  connectionProviderId,
  handle,
}: {
  id: string;
  userWorkspaceId: string;
  applicationId: string;
  connectionProviderId: string;
  handle: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `INSERT INTO core."connectedAccount"
       (id, handle, provider, visibility, "workspaceId", "userWorkspaceId", "applicationId", "connectionProviderId")
     VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)`,
    [
      id,
      handle,
      ConnectedAccountProvider.APP,
      SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId,
      applicationId,
      connectionProviderId,
    ],
  );
};
