import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myAppPreferencesApplicationsQueryFactory } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications-query-factory.util';
import { myAppPreferencesApplications } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications.util';
import { myAppPreferencesApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-app-preferences-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { myUserApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-user-application-variables.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Personal application preferences should fail', () => {
  let application: ApplicationWithVariable;
  let applicationToken: string;
  const otherWorkspaceApplicationId = uuidv4();
  const otherWorkspaceApplicationUniversalIdentifier = uuidv4();

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Personal Preferences Access',
      variableKey: 'PERSONAL_PREFERENCE',
      variableScope: 'USER',
    });
    const tokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
    await globalThis.testDataSource.query(
      `INSERT INTO core."application"
         (id, "universalIdentifier", name, "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        otherWorkspaceApplicationId,
        otherWorkspaceApplicationUniversalIdentifier,
        'Other Workspace Preferences',
        'other-workspace-preferences',
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."applicationVariable"
         ("universalIdentifier", key, value, scope, "defaultValue", "applicationId", "workspaceId")
       VALUES ($1, $2, NULL, 'USER', $3, $4, $5)`,
      [
        uuidv4(),
        'FOREIGN_PREFERENCE',
        'foreign default',
        otherWorkspaceApplicationId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: true,
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationVariable" WHERE "applicationId" = $1`,
      [otherWorkspaceApplicationId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."application" WHERE id = $1`,
      [otherWorkspaceApplicationId],
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it.each([
    { principal: 'an API key', getToken: () => API_KEY_ACCESS_TOKEN },
    { principal: 'an application token', getToken: () => applicationToken },
  ])('should refuse $principal for both member reads', async ({ getToken }) => {
    const { errors: listingErrors } = await myAppPreferencesApplications({
      input: {},
      token: getToken(),
      expectToFail: true,
    });
    const { errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: getToken(),
      expectToFail: true,
    });

    expect(listingErrors).toHaveLength(1);
    expect(listingErrors[0].extensions.code).toBe('FORBIDDEN');
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('should refuse unauthenticated access', async () => {
    const response = await makeMetadataApiRequest(
      myAppPreferencesApplicationsQueryFactory({ input: {} }),
      null,
    );

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.data?.myAppPreferencesApplications).toBeUndefined();
  });

  it('should refuse a signed session with no current workspace membership', async () => {
    const token = await getAppProviderByClassName<JwtWrapperService>(
      'JwtWrapperService',
    ).signAsyncOrThrow(
      {
        sub: USER_DATA_SEED_IDS.JONY,
        userId: USER_DATA_SEED_IDS.JONY,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: uuidv4(),
        type: JwtTokenTypeEnum.ACCESS,
        authProvider: AuthProviderEnum.Password,
      },
      { expiresIn: '1h' },
    );
    const { data: applicationData, errors: listingErrors } =
      await myAppPreferencesApplications({
        input: {},
        token,
        expectToFail: true,
      });
    const { data, errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token,
      expectToFail: true,
    });

    expect(listingErrors).toHaveLength(1);
    expect(applicationData?.myAppPreferencesApplications).toBeUndefined();
    expect(errors).toHaveLength(1);
    expect(data?.myAppPreferencesApplicationVariables).toBeUndefined();
  });

  it('should exclude and reject an application installed in another workspace', async () => {
    const { data } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier:
          otherWorkspaceApplicationUniversalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      otherWorkspaceApplicationId,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('should refuse member reads while the rollout flag is disabled', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      const { errors: listingErrors } = await myAppPreferencesApplications({
        input: {},
        expectToFail: true,
      });
      const { errors } = await myAppPreferencesApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        expectToFail: true,
      });

      expect(listingErrors).toHaveLength(1);
      expect(listingErrors[0].extensions.code).toBe('FORBIDDEN');
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

  it('should keep the app-facing variable query unavailable to a member session', async () => {
    const { errors } = await myUserApplicationVariables({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
  });

  it.each([ApplicationState.INSTALLING, ApplicationState.UNINSTALLING])(
    'should exclude and reject an application in %s state',
    async (state) => {
      await globalThis.testDataSource.query(
        `UPDATE core."application" SET state = $1 WHERE id = $2`,
        [state, application.id],
      );

      try {
        const { data } = await myAppPreferencesApplications({
          input: {},
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        });
        const { errors } = await myAppPreferencesApplicationVariables({
          input: {
            applicationUniversalIdentifier: application.universalIdentifier,
          },
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          expectToFail: true,
        });

        expect(
          data.myAppPreferencesApplications.map(({ id }) => id),
        ).not.toContain(application.id);
        expect(errors).toHaveLength(1);
        expect(errors[0].extensions.code).toBe('NOT_FOUND');
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."application" SET state = $1 WHERE id = $2`,
          [ApplicationState.INSTALLED, application.id],
        );
      }
    },
  );

  it('should exclude and reject an application after uninstall', async () => {
    await uninstallApplication({
      universalIdentifier: application.universalIdentifier,
    });
    const { data } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { errors } = await myAppPreferencesApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      application.id,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('NOT_FOUND');
  });
});
