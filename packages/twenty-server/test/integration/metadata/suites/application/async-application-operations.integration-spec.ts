import {
  installApplicationAsyncQueryFactory,
  uninstallApplicationAsyncQueryFactory,
} from 'test/integration/metadata/suites/application/utils/async-application-operation-query-factory.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(180000);

const APP_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

const buildTarball = (version: string): Promise<Buffer> =>
  createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
      }),
    ),
    'package.json': JSON.stringify({
      name: 'test-async-application-operations',
      version,
    }),
  });

const findApplication = async (): Promise<
  { id: string; state: string } | undefined
> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT id, state FROM core."application" WHERE "universalIdentifier" = $1`,
    [APP_UNIVERSAL_IDENTIFIER],
  );

  return application;
};

const setApplicationState = async (state: string): Promise<void> => {
  await globalThis.testDataSource.query(
    `UPDATE core."application" SET state = $2 WHERE "universalIdentifier" = $1`,
    [APP_UNIVERSAL_IDENTIFIER, state],
  );
};

const installAsync = async ({
  version,
  universalIdentifier = APP_UNIVERSAL_IDENTIFIER,
}: { version?: string; universalIdentifier?: string } = {}) => {
  const response = await makeMetadataAPIRequest(
    installApplicationAsyncQueryFactory({ universalIdentifier, version }),
  );

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};

const uninstallAsync = async () => {
  const response = await makeMetadataAPIRequest(
    uninstallApplicationAsyncQueryFactory({
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    }),
  );

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};

describe('Async application operations', () => {
  beforeAll(async () => {
    jest.useRealTimers();

    await uploadAppTarball({
      tarballBuffer: await buildTarball('1.0.0'),
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('claims the row, then installs it in a worker job', async () => {
    const { data, errors } = await installAsync();

    expect(errors).toBeUndefined();
    expect(data.installApplicationAsync.state).toBe('INSTALLING');
    expect(await findApplication()).toMatchObject({ state: 'INSTALLING' });

    await waitForAllJobsToFinish();

    expect(await findApplication()).toMatchObject({ state: 'INSTALLED' });
  });

  it('surfaces an enqueue-time version progression failure synchronously', async () => {
    const { errors } = await installAsync({ version: '1.0.0' });

    expect(errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(await findApplication()).toMatchObject({ state: 'INSTALLED' });
  });

  it('surfaces an unknown registration synchronously', async () => {
    const { errors } = await installAsync({ universalIdentifier: uuidv4() });

    expect(errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });

  it('rejects an async operation that loses the state gate', async () => {
    await setApplicationState('UPGRADING');

    const { errors } = await uninstallAsync();

    expect(errors?.[0]?.extensions?.code).toBe('CONFLICT');

    await setApplicationState('INSTALLED');
  });

  it('rejects a synchronous operation that loses the state gate', async () => {
    await setApplicationState('UNINSTALLING');

    const { errors } = await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
      expectToFail: true,
    });

    expect(errors?.[0]?.extensions?.code).toBe('CONFLICT');

    await setApplicationState('INSTALLED');
  });

  it('claims the row, then uninstalls it in a worker job', async () => {
    const { data, errors } = await uninstallAsync();

    expect(errors).toBeUndefined();
    expect(data.uninstallApplicationAsync.state).toBe('UNINSTALLING');

    await waitForAllJobsToFinish();

    expect(await findApplication()).toBeUndefined();
  });
});
