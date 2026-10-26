import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';

export const cleanupApplicationAndAppRegistration = async ({
  applicationUniversalIdentifier,
  token,
}: {
  applicationUniversalIdentifier: string;
  token?: string;
}) => {
  try {
    await uninstallApplication({
      universalIdentifier: applicationUniversalIdentifier,
      expectToFail: false,
      token,
    });
  } catch {
    // May fail if the sync never succeeded
  }

  await globalThis.testDataSource.query(
    `UPDATE core."application"
     SET "packageJsonFileId" = NULL, "yarnLockFileId" = NULL
     WHERE "universalIdentifier" = $1`,
    [applicationUniversalIdentifier],
  );

  await globalThis.testDataSource.query(
    `DELETE FROM core."file" WHERE "applicationId" IN (
      SELECT id FROM core."application" WHERE "universalIdentifier" = $1
    )`,
    [applicationUniversalIdentifier],
  );

  await globalThis.testDataSource.query(
    `DELETE FROM core."application"
     WHERE "universalIdentifier" = $1`,
    [applicationUniversalIdentifier],
  );

  await globalThis.testDataSource.query(
    `DELETE FROM core."applicationRegistration"
     WHERE "universalIdentifier" = $1`,
    [applicationUniversalIdentifier],
  );
};
