import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { buildConnectionProviderManifest } from 'test/integration/metadata/suites/connection-provider/utils/build-connection-provider-manifest.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { insertAppConnectedAccount } from 'test/integration/metadata/suites/connection-provider/utils/insert-app-connected-account.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

type ConnectedAccountOwnershipRow = {
  id: string;
  userWorkspaceId: string;
  archivedAt: Date | null;
};

const findConnectedAccounts = (
  ids: string[],
): Promise<ConnectedAccountOwnershipRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, "userWorkspaceId", "archivedAt"
       FROM core."connectedAccount"
      WHERE id = ANY($1::uuid[])
   ORDER BY id`,
    [ids],
  );

describe('Connected account ownership transfer with an existing provider connection', () => {
  let appId: string;
  let roleId: string;
  let providerId: string;
  let departingConnectedAccountId: string;
  let custodianConnectedAccountId: string;

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    providerId = uuidv4();
    departingConnectedAccountId = uuidv4();
    custodianConnectedAccountId = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Test Application',
      description: 'App for testing connection ownership transfer',
      sourcePath: 'test-ownership-transfer',
    });
    jest.useRealTimers();

    await syncApplication({
      manifest: buildConnectionProviderManifest({ appId, roleId, providerId }),
      expectToFail: false,
    });

    const [provider] = await findConnectionProvidersByApplication(appId);

    await insertAppConnectedAccount({
      id: departingConnectedAccountId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      applicationId: provider.applicationId,
      connectionProviderId: provider.id,
      handle: 'tim@apple.dev',
    });
    await insertAppConnectedAccount({
      id: custodianConnectedAccountId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      applicationId: provider.applicationId,
      connectionProviderId: provider.id,
      handle: 'jane@apple.dev',
    });
  }, 60000);

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE id = ANY($1::uuid[])`,
      [[departingConnectedAccountId, custodianConnectedAccountId]],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('archives the departing connection and hands it to a custodian who already holds the same provider', async () => {
    await getAppProviderByClassName<ConnectedAccountMetadataService>(
      'ConnectedAccountMetadataService',
    ).transferOwnership({
      fromUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      toUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const rows = await findConnectedAccounts([
      departingConnectedAccountId,
      custodianConnectedAccountId,
    ]);
    const departing = rows.find(
      (row) => row.id === departingConnectedAccountId,
    );
    const custodian = rows.find(
      (row) => row.id === custodianConnectedAccountId,
    );

    expect(departing?.userWorkspaceId).toBe(USER_WORKSPACE_DATA_SEED_IDS.JANE);
    expect(departing?.archivedAt).not.toBeNull();
    expect(custodian?.userWorkspaceId).toBe(USER_WORKSPACE_DATA_SEED_IDS.JANE);
    expect(custodian?.archivedAt).toBeNull();
  }, 60000);
});
