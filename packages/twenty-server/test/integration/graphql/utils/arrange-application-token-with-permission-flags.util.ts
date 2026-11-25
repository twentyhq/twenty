import { randomUUID } from 'node:crypto';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationWithVariable } from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const arrangeApplicationTokenWithPermissionFlags = async ({
  permissionFlagUniversalIdentifiers,
  isUserBound,
}: {
  permissionFlagUniversalIdentifiers: string[];
  isUserBound: boolean;
}): Promise<{ token: string; cleanup: () => Promise<void> }> => {
  const application = await setupApplicationWithVariable({
    name: `Permission flags ${randomUUID().slice(0, 8)}`,
    variableKey: 'PERMISSION_FLAGS',
    permissionFlagUniversalIdentifiers,
  });

  const cleanup = () =>
    cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });

  try {
    const { applicationAccessToken } = isUserBound
      ? await generateAppleAdminApplicationTokenPair({
          applicationId: application.id,
        })
      : await generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: application.id,
        });

    return { token: applicationAccessToken.token, cleanup };
  } catch (error) {
    await cleanup();

    throw error;
  }
};
