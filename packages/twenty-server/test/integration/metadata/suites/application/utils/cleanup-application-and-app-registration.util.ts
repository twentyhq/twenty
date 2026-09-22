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

  // View/ViewField rows an app contributes to a shared standard object (e.g.
  // Person) aren't scoped to the app's own object rows and aren't
  // cascade-cleaned by this raw-SQL fallback path (used when the real
  // uninstallApplication mutation fails, e.g. sync itself never succeeded) -
  // without this, orphaned rows accumulate indefinitely in the shared test
  // workspace and can corrupt fixed-value lookups in unrelated specs.
  // Delete viewField before view (children before parent) to avoid any
  // future FK-ordering surprise.
  await globalThis.testDataSource.query(
    `DELETE FROM core."viewField" WHERE "applicationId" IN (
      SELECT id FROM core."application" WHERE "universalIdentifier" = $1
    )`,
    [applicationUniversalIdentifier],
  );

  await globalThis.testDataSource.query(
    `DELETE FROM core."view" WHERE "applicationId" IN (
      SELECT id FROM core."application" WHERE "universalIdentifier" = $1
    )`,
    [applicationUniversalIdentifier],
  );

  // Role rows an app installs (e.g. "App A Role") aren't cascade-cleaned by
  // this raw-SQL fallback path either - if uninstallApplication rejects or
  // times out (e.g. a transient DB read timeout) before the mutation's own
  // cleanup runs, the role row outlives the application row deleted below,
  // and its unique (label, workspaceId) constraint then collides with the
  // next run's attempt to install a role with the same label. All of role's
  // own FK children (objectPermission, fieldPermission, roleTarget, etc.)
  // are ON DELETE CASCADE, so deleting the role row alone is sufficient.
  await globalThis.testDataSource.query(
    `DELETE FROM core."role" WHERE "applicationId" IN (
      SELECT id FROM core."application" WHERE "universalIdentifier" = $1
    )`,
    [applicationUniversalIdentifier],
  );

  // FieldMetadata rows are deliberately not deleted here: unlike View/
  // ViewField, a FieldMetadata row backs an actual column on the workspace's
  // physical data schema, so raw-deleting it without a companion
  // column-drop migration would leave a dangling, untracked column.

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
