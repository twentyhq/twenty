import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';

export const cleanupApplicationAndAppRegistration = async ({
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
}) => {
  try {
    await uninstallApplication({
      universalIdentifier: applicationUniversalIdentifier,
      expectToFail: false,
    });
  } catch {
    // May fail if the sync never succeeded
  }

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
