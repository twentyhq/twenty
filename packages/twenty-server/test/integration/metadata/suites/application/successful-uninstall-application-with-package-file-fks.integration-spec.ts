import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

describe('Uninstall application with package file FKs populated', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing uninstall with package file FKs',
      sourcePath: 'test-uninstall-package-file-fks',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
      }),
      expectToFail: false,
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('uninstalls the application and deletes its file rows in one pass', async () => {
    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Dependencies',
      filePath: 'yarn.lock',
      fileBuffer: Buffer.from('# test yarn.lock\n'),
      filename: 'yarn.lock',
      contentType: 'text/plain',
      expectToFail: false,
    });

    jest.useFakeTimers();

    const [application] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    const applicationId: string = application.id;

    await globalThis.testDataSource.query(
      `UPDATE core."application" a
       SET "packageJsonFileId" = (
             SELECT f.id FROM core."file" f
             WHERE f."applicationId" = a.id
               AND f.path = 'dependencies/package.json'
           ),
           "yarnLockFileId" = (
             SELECT f.id FROM core."file" f
             WHERE f."applicationId" = a.id
               AND f.path = 'dependencies/yarn.lock'
           )
       WHERE a.id = $1`,
      [applicationId],
    );

    const [applicationBeforeUninstall] = await globalThis.testDataSource.query(
      `SELECT "packageJsonFileId", "yarnLockFileId"
       FROM core."application" WHERE id = $1`,
      [applicationId],
    );

    expect(applicationBeforeUninstall.packageJsonFileId).not.toBeNull();
    expect(applicationBeforeUninstall.yarnLockFileId).not.toBeNull();

    const { data, errors } = await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.uninstallApplication).toBe(true);

    const applicationsAfterUninstall = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    expect(applicationsAfterUninstall).toHaveLength(0);

    const fileRowsAfterUninstall = await globalThis.testDataSource.query(
      `SELECT id FROM core."file" WHERE "applicationId" = $1`,
      [applicationId],
    );

    expect(fileRowsAfterUninstall).toHaveLength(0);
  }, 60000);
});
