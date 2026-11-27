import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { findWorkspaceCustomApplicationUniversalIdentifier } from 'test/integration/metadata/suites/application/utils/find-workspace-custom-application-universal-identifier.util';
import { createPermissionTestActiveWorkspace } from 'test/integration/permissions/utils/create-permission-test-active-workspace.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

export type WorkspaceCustomApplicationSyncWorkspace = {
  workspaceId: string;
  accessToken: string;
  manifest: Manifest;
  deleteWorkspace: () => Promise<void>;
};

// A fresh workspace, so syncing its custom application leaves the seeded ones untouched
export const createWorkspaceCustomApplicationSyncWorkspace =
  async (): Promise<WorkspaceCustomApplicationSyncWorkspace> => {
    const { workspaceId, adminAccessToken: accessToken } =
      await createPermissionTestActiveWorkspace();

    const { data } = await exportApplication({
      universalIdentifier:
        await findWorkspaceCustomApplicationUniversalIdentifier(accessToken),
      expectToFail: false,
      token: accessToken,
    });

    return {
      workspaceId,
      accessToken,
      manifest: data.exportApplication.manifest,
      deleteWorkspace: async () => {
        await getAppProviderByClassName<WorkspaceService>(
          'WorkspaceService',
        ).deleteWorkspace(workspaceId);
      },
    };
  };
