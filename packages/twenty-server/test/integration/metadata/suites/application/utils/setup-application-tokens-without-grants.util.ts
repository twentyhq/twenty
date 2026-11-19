import { randomUUID } from 'node:crypto';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationWithVariable } from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import {
  ROLE_WITHOUT_GRANTS,
  findRoleGrants,
} from 'test/integration/metadata/suites/role/utils/find-role-grants.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// An unbound token (logic functions) and a user-bound one (front components)
export const setupApplicationTokensWithoutGrants = async (): Promise<{
  tokens: string[];
  cleanup: () => Promise<void>;
}> => {
  const application = await setupApplicationWithVariable({
    name: `Application without grants ${randomUUID().slice(0, 8)}`,
    variableKey: 'APPLICATION_WITHOUT_GRANTS',
    permissionFlagUniversalIdentifiers: [],
  });
  const cleanup = () =>
    cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });

  try {
    expect(await findRoleGrants(application.requestedRoleId)).toEqual(
      ROLE_WITHOUT_GRANTS,
    );

    const [unboundTokenPair, userBoundTokenPair] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
      generateAppleAdminApplicationTokenPair({ applicationId: application.id }),
    ]);

    return {
      tokens: [
        unboundTokenPair.applicationAccessToken.token,
        userBoundTokenPair.applicationAccessToken.token,
      ],
      cleanup,
    };
  } catch (error) {
    await cleanup();

    throw error;
  }
};
