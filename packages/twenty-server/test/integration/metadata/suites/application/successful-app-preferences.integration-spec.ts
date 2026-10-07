import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myAppPreferencesApplications } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications.util';
import { myAppPreferencesApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-app-preferences-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

describe('Personal application preferences should succeed', () => {
  let application: ApplicationWithVariable;
  let secretApplication: ApplicationWithVariable;
  let workspaceApplication: ApplicationWithVariable;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Personal Preferences',
      variableKey: 'PERSONAL_PREFERENCE',
      variableScope: 'USER',
      value: 'default',
    });
    secretApplication = await setupApplicationWithVariable({
      name: 'Personal Secret Preferences',
      variableKey: 'PERSONAL_SECRET',
      variableScope: 'USER',
      isSecret: true,
    });
    workspaceApplication = await setupApplicationWithVariable({
      name: 'Workspace Secret Preferences',
      variableKey: 'WORKSPACE_SECRET',
      isSecret: true,
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    for (const installedApplication of [
      application,
      secretApplication,
      workspaceApplication,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier:
          installedApplication.universalIdentifier,
      });
    }
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should list USER capability without accounts or the applications administration permission', async () => {
    const { data, errors } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesApplications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: application.id }),
        expect.objectContaining({ id: secretApplication.id }),
      ]),
    );
    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      workspaceApplication.id,
    );
  });

  it('should read declarations and manifest defaults for an ordinary member', async () => {
    const { data, errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesApplicationVariables).toEqual([
      {
        key: application.variableKey,
        value: 'default',
        label: '',
        description: '',
        type: 'TEXT',
        options: null,
        isSecret: false,
        isRequired: false,
        isDeprecated: false,
      },
    ]);
  });

  it('should read and save different values for two members of the same workspace', async () => {
    for (const { token, value } of [
      { token: APPLE_JONY_MEMBER_ACCESS_TOKEN, value: 'jony' },
      { token: APPLE_JANE_ADMIN_ACCESS_TOKEN, value: 'jane' },
    ]) {
      const { errors: updateErrors } = await updateMyUserApplicationVariable({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
          key: application.variableKey,
          value,
        },
        token,
      });
      const { data, errors } = await myAppPreferencesApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        gqlFields: 'key value',
        token,
      });

      expect(updateErrors).toBeUndefined();
      expect(errors).toBeUndefined();
      expect(data.myAppPreferencesApplicationVariables).toEqual([
        { key: application.variableKey, value },
      ]);
    }
  });

  it.each(['', 'false', '0'])(
    'should preserve an explicit %j override instead of the default',
    async (value) => {
      await updateMyUserApplicationVariable({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
          key: application.variableKey,
          value,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      const { data, errors } = await myAppPreferencesApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        gqlFields: 'key value',
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const { data: otherMemberData } =
        await myAppPreferencesApplicationVariables({
          input: {
            applicationUniversalIdentifier: application.universalIdentifier,
          },
          gqlFields: 'key value',
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

      expect(errors).toBeUndefined();
      expect(data.myAppPreferencesApplicationVariables).toEqual([
        { key: application.variableKey, value },
      ]);
      expect(otherMemberData.myAppPreferencesApplicationVariables).toEqual([
        { key: application.variableKey, value: 'jane' },
      ]);
    },
  );

  it("should mask a personal secret and leave another member's unset secret empty", async () => {
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: secretApplication.universalIdentifier,
        key: secretApplication.variableKey,
        value: 'personal-secret-plaintext',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { data } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: secretApplication.universalIdentifier,
      },
      gqlFields: 'key value isSecret',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { data: otherMemberData } =
      await myAppPreferencesApplicationVariables({
        input: {
          applicationUniversalIdentifier: secretApplication.universalIdentifier,
        },
        gqlFields: 'key value isSecret',
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

    expect(data.myAppPreferencesApplicationVariables).toEqual([
      {
        key: secretApplication.variableKey,
        value: `pe${SECRET_APPLICATION_VARIABLE_MASK}`,
        isSecret: true,
      },
    ]);
    expect(JSON.stringify(data)).not.toContain('personal-secret-plaintext');
    expect(otherMemberData.myAppPreferencesApplicationVariables).toEqual([
      { key: secretApplication.variableKey, value: '', isSecret: true },
    ]);
  });

  it('should leave a cleared personal secret empty', async () => {
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: secretApplication.universalIdentifier,
        key: secretApplication.variableKey,
        value: '',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { data } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: secretApplication.universalIdentifier,
      },
      gqlFields: 'key value',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(data.myAppPreferencesApplicationVariables).toEqual([
      { key: secretApplication.variableKey, value: '' },
    ]);
  });

  it('should exclude workspace variable declarations and secrets from member reads', async () => {
    const { data, errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier:
          workspaceApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.myAppPreferencesApplicationVariables).toEqual([]);
  });

  it('should keep personal preferences available while an installed application upgrades', async () => {
    await globalThis.testDataSource.query(
      `UPDATE core."application" SET state = $1 WHERE id = $2`,
      [ApplicationState.UPGRADING, application.id],
    );

    try {
      const { data: applicationData } = await myAppPreferencesApplications({
        input: {},
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const { data, errors } = await myAppPreferencesApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(
        applicationData.myAppPreferencesApplications.map(({ id }) => id),
      ).toContain(application.id);
      expect(errors).toBeUndefined();
      expect(data.myAppPreferencesApplicationVariables).toEqual([
        expect.objectContaining({ key: application.variableKey, value: '0' }),
      ]);
    } finally {
      await globalThis.testDataSource.query(
        `UPDATE core."application" SET state = $1 WHERE id = $2`,
        [ApplicationState.INSTALLED, application.id],
      );
    }
  });
});
