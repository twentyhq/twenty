import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UID = uuidv4();

type TestContext = {
  ownerWorkspaceId: string | null;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when another workspace owns the application registration',
    context: { ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID },
  },
  {
    title: 'when no workspace has claimed the application registration',
    context: { ownerWorkspaceId: null },
  },
];

const normalizeMessage = (message: string) =>
  message.replace(
    new RegExp(TEST_APP_UID, 'g'),
    '<applicationUniversalIdentifier>',
  );

const setTestRegistrationOwnerWorkspaceId = async (
  ownerWorkspaceId: string | null,
) => {
  await globalThis.testDataSource.query(
    `UPDATE core."applicationRegistration" SET "workspaceId" = $1
     WHERE "universalIdentifier" = $2`,
    [ownerWorkspaceId, TEST_APP_UID],
  );
};

describe('Application export should fail', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UID,
      name: 'Test Application Export Ownership App',
      description: 'App for verifying registration ownership on export',
      sourcePath: 'test-application-export-ownership',
    });
  }, 60000);

  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(async () => {
    await setTestRegistrationOwnerWorkspaceId(SEED_APPLE_WORKSPACE_ID);
    jest.useFakeTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { data: exportedWhileOwned } = await exportApplication({
        universalIdentifier: TEST_APP_UID,
      });

      expect(
        exportedWhileOwned.exportApplication.application.universalIdentifier,
      ).toBe(TEST_APP_UID);

      await setTestRegistrationOwnerWorkspaceId(context.ownerWorkspaceId);

      const { data, errors } = await exportApplication({
        universalIdentifier: TEST_APP_UID,
        expectToFail: true,
      });

      expect(data).toBeNull();
      expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
    },
    30000,
  );
});
