import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const insertAppPreferencesConnectedAccount = async ({
  id,
  applicationId,
  connectionProviderId,
  userWorkspaceId,
  visibility = 'user',
  archivedAt = null,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  id: string;
  applicationId: string;
  connectionProviderId: string;
  userWorkspaceId: string;
  visibility?: 'user' | 'workspace';
  archivedAt?: Date | null;
  workspaceId?: string;
}) => {
  await globalThis.testDataSource.query(
    `INSERT INTO core."connectedAccount"
       (id, handle, name, provider, visibility, "workspaceId", "userWorkspaceId",
        "applicationId", "connectionProviderId", "archivedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      'synthetic@apple.dev',
      'Synthetic preference account',
      ConnectedAccountProvider.APP,
      visibility,
      workspaceId,
      userWorkspaceId,
      applicationId,
      connectionProviderId,
      archivedAt,
    ],
  );
};
