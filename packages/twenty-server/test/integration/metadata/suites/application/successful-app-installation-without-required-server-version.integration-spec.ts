import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.setTimeout(120000);

const INJECTED_CURSOR_MARKER =
  'integration-test-install-without-required-server-version';

type TestContext = {
  engines: Record<string, string> | undefined;
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when package.json declares no engines',
    context: { engines: undefined },
  },
  {
    title: 'when package.json declares engines without twenty',
    context: { engines: { node: '^24.5.0' } },
  },
];

describe('Install application without a required server version', () => {
  let universalIdentifier: string;

  beforeAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    universalIdentifier = uuidv4();
  });

  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."upgradeMigration"
       WHERE "workspaceId" = $1 AND "executedByVersion" = $2`,
      [SEED_APPLE_WORKSPACE_ID, INJECTED_CURSOR_MARKER],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'installs without checking the server version $title',
    async ({ context }) => {
      const tarball = await createAppTarball({
        'manifest.json': JSON.stringify(
          buildBaseManifest({ appId: universalIdentifier, roleId: uuidv4() }),
        ),
        'package.json': JSON.stringify({
          name: `test-install-without-required-server-version-${universalIdentifier}`,
          version: '1.0.0',
          ...(context.engines ? { engines: context.engines } : {}),
        }),
      });

      const uploadResult = await uploadAppTarball({
        tarballBuffer: tarball,
        universalIdentifier,
      });

      expect(uploadResult.errors).toBeUndefined();

      await global.testDataSource.query(
        `INSERT INTO core."upgradeMigration"
           (name, status, attempt, "executedByVersion", "workspaceId", "isInitial")
         VALUES ($1, 'completed', 2, $2, $3, false)`,
        [
          '1.0.0_UnknownLegacyCommand_1700000000000',
          INJECTED_CURSOR_MARKER,
          SEED_APPLE_WORKSPACE_ID,
        ],
      );

      const { data, errors } = await installApplication({
        input: { universalIdentifier },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(data.installApplication.id).toEqual(expect.any(String));
    },
  );
});
