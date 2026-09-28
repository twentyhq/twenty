import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// The session-bound pair the front component host mints for the seeded Apple
// admin: the only shape a request can obtain, now that no mutation hands out
// an application's credentials.
export const generateAppleAdminApplicationTokenPair = ({
  applicationId,
}: {
  applicationId: string;
}) =>
  generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId,
    userId: USER_DATA_SEED_IDS.JANE,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
  });
