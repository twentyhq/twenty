import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myAppPreferencesApplications } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications.util';
import { setupApplicationWithVariable } from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { setupAppPreferencesConnectionApplication } from 'test/integration/metadata/suites/connection-provider/utils/setup-app-preferences-connection-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Personal preferences application connection capabilities', () => {
  let connectionApplication: Awaited<
    ReturnType<typeof setupAppPreferencesConnectionApplication>
  >;
  let combinedApplication: typeof connectionApplication;
  let variableApplication: Awaited<
    ReturnType<typeof setupApplicationWithVariable>
  >;
  let workspaceApplication: typeof variableApplication;
  const foreignApplicationId = uuidv4();

  beforeAll(async () => {
    connectionApplication = await setupAppPreferencesConnectionApplication({
      name: 'Connection Preferences',
    });
    combinedApplication = await setupAppPreferencesConnectionApplication({
      name: 'Combined Preferences',
      withUserVariable: true,
    });
    variableApplication = await setupApplicationWithVariable({
      name: 'Variable Preferences',
      variableKey: 'PERSONAL_PREFERENCE',
      variableScope: 'USER',
    });
    workspaceApplication = await setupApplicationWithVariable({
      name: 'Workspace Only Preferences',
      variableKey: 'WORKSPACE_SECRET',
      isSecret: true,
    });
    await globalThis.testDataSource.query(
      `INSERT INTO core."application"
         (id, "universalIdentifier", name, "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        foreignApplicationId,
        uuidv4(),
        'Foreign Connection Preferences',
        'foreign-connection-preferences',
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectionProvider"
         ("universalIdentifier", name, "displayName", type, "applicationId", "workspaceId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(),
        'foreign',
        'Foreign Provider',
        'oauth',
        foreignApplicationId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 180000);

  afterAll(async () => {
    for (const application of [
      connectionApplication,
      combinedApplication,
      variableApplication,
      workspaceApplication,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
    await globalThis.testDataSource.query(
      `DELETE FROM core."application" WHERE id = $1`,
      [foreignApplicationId],
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });
  }, 120000);

  it('lists installed connection-only and USER apps once for a member without Applications permission', async () => {
    const { data, errors } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const applications = data.myAppPreferencesApplications;

    expect(errors).toBeUndefined();
    expect(applications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: connectionApplication.id,
          hasConnectionProviders: true,
        }),
        expect.objectContaining({
          id: combinedApplication.id,
          hasConnectionProviders: true,
        }),
        expect.objectContaining({
          id: variableApplication.id,
          hasConnectionProviders: false,
        }),
      ]),
    );
    expect(
      applications.filter(({ id }) => id === combinedApplication.id),
    ).toHaveLength(1);
    expect(applications.map(({ id }) => id)).not.toContain(
      workspaceApplication.id,
    );
    expect(applications.map(({ id }) => id)).not.toContain(
      foreignApplicationId,
    );
  });

  it.each([
    { state: ApplicationState.INSTALLING, included: false },
    { state: ApplicationState.UNINSTALLING, included: false },
    { state: ApplicationState.UPGRADING, included: true },
  ])(
    'respects the $state lifecycle for connection-only apps',
    async ({ state, included }) => {
      await globalThis.testDataSource.query(
        `UPDATE core."application" SET state = $1 WHERE id = $2`,
        [state, connectionApplication.id],
      );

      try {
        const { data, errors } = await myAppPreferencesApplications({
          input: {},
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        });

        expect(errors).toBeUndefined();
        expect(
          data.myAppPreferencesApplications.some(
            ({ id }) => id === connectionApplication.id,
          ),
        ).toBe(included);
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."application" SET state = $1 WHERE id = $2`,
          [ApplicationState.INSTALLED, connectionApplication.id],
        );
      }
    },
  );

  it('keeps the connection-only listing behind the preferences flag', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      const { errors } = await myAppPreferencesApplications({
        input: {},
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].extensions.code).toBe('FORBIDDEN');
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: true,
        expectToFail: false,
      });
    }
  });

  it('removes the connection-only app after actual uninstall', async () => {
    const { errors: uninstallErrors } = await uninstallApplication({
      universalIdentifier: connectionApplication.universalIdentifier,
    });
    const { data, errors } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(uninstallErrors).toBeUndefined();
    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      connectionApplication.id,
    );
  });
});
