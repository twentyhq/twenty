import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myAppPreferencesApplications } from 'test/integration/metadata/suites/application/utils/my-app-preferences-applications.util';
import { myAppPreferencesSettingsMenuItemsQueryFactory } from 'test/integration/metadata/suites/application/utils/my-app-preferences-settings-menu-items-query-factory.util';
import { myAppPreferencesSettingsMenuItems } from 'test/integration/metadata/suites/application/utils/my-app-preferences-settings-menu-items.util';
import { setupAppPreferencesSettingsApplication } from 'test/integration/metadata/suites/application/utils/setup-app-preferences-settings-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
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
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

describe('Personal application settings menu items should fail', () => {
  let application: Awaited<
    ReturnType<typeof setupAppPreferencesSettingsApplication>
  >;
  let applicationToken: string;
  let memberApplicationToken: string;
  const foreignApplicationId = uuidv4();
  const foreignApplicationUniversalIdentifier = uuidv4();
  const foreignFrontComponentId = uuidv4();

  beforeAll(async () => {
    application = await setupAppPreferencesSettingsApplication({
      name: 'Personal Settings Access',
    });
    const tokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });
    const memberTokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
      userId: USER_DATA_SEED_IDS.JONY,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
    memberApplicationToken = memberTokenPair.applicationAccessToken.token;
    await globalThis.testDataSource.query(
      `INSERT INTO core."application"
         (id, "universalIdentifier", name, "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        foreignApplicationId,
        foreignApplicationUniversalIdentifier,
        'Foreign Personal Settings',
        'foreign-personal-settings',
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."frontComponent"
         (id, "universalIdentifier", name, "sourceComponentPath", "builtComponentPath",
          "componentName", "builtComponentChecksum", "applicationId", "workspaceId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        foreignFrontComponentId,
        uuidv4(),
        'Foreign Settings',
        'src/foreign.tsx',
        'src/foreign.mjs',
        'ForeignSettings',
        'foreign-checksum',
        foreignApplicationId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."settingsMenuItem"
         ("universalIdentifier", "frontComponentId", title, position, scope, "applicationId", "workspaceId")
       VALUES ($1, $2, $3, $4, 'USER', $5, $6)`,
      [
        uuidv4(),
        foreignFrontComponentId,
        'Foreign preferences',
        0,
        foreignApplicationId,
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
      `DELETE FROM core."application" WHERE id = $1`,
      [foreignApplicationId],
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });
  }, 120000);

  it.each([
    { principal: 'an API key', getToken: () => API_KEY_ACCESS_TOKEN },
    {
      principal: 'an unbound application token',
      getToken: () => applicationToken,
    },
    {
      principal: 'a member-bound application token',
      getToken: () => memberApplicationToken,
    },
  ])('rejects $principal', async ({ getToken }) => {
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: getToken(),
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('FORBIDDEN');
    expect(data?.myAppPreferencesSettingsMenuItems).toBeUndefined();
  });

  it('rejects an unauthenticated request', async () => {
    const response = await makeMetadataApiRequest(
      myAppPreferencesSettingsMenuItemsQueryFactory({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
      }),
      null,
    );

    expect(response.body.errors).toHaveLength(1);
    expect(
      response.body.data?.myAppPreferencesSettingsMenuItems,
    ).toBeUndefined();
  });

  it('rejects a signed session with no workspace membership', async () => {
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
    const { data, errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token,
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
    expect(data?.myAppPreferencesSettingsMenuItems).toBeUndefined();
  });

  it('rejects and excludes a custom-only application in another workspace', async () => {
    const { data } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: foreignApplicationUniversalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      foreignApplicationId,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('keeps custom menu reads behind the preferences flag', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
      value: false,
      expectToFail: false,
    });

    try {
      const { errors } = await myAppPreferencesSettingsMenuItems({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
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

  it.each([ApplicationState.INSTALLING, ApplicationState.UNINSTALLING])(
    'rejects and excludes a custom-only application in %s state',
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
        const { errors } = await myAppPreferencesSettingsMenuItems({
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

  it('rejects a USER menu whose workspace differs from its installed application', async () => {
    const menuItem = application.settingsMenuItems.find(
      ({ scope }) => scope === 'USER',
    );

    jestExpectToBeDefined(menuItem);

    await globalThis.testDataSource.query(
      `UPDATE core."settingsMenuItem" SET "workspaceId" = $1 WHERE id = $2`,
      [SEED_YCOMBINATOR_WORKSPACE_ID, menuItem.id],
    );

    try {
      const { data, errors } = await myAppPreferencesSettingsMenuItems({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].extensions.code).toBe('NOT_FOUND');
      expect(data?.myAppPreferencesSettingsMenuItems).toBeUndefined();
    } finally {
      await globalThis.testDataSource.query(
        `UPDATE core."settingsMenuItem" SET "workspaceId" = $1 WHERE id = $2`,
        [SEED_APPLE_WORKSPACE_ID, menuItem.id],
      );
    }
  });

  it.each([
    {
      boundary: 'application',
      column: 'applicationId',
      foreignId: foreignApplicationId,
      ownId: () => application.id,
    },
    {
      boundary: 'workspace',
      column: 'workspaceId',
      foreignId: SEED_YCOMBINATOR_WORKSPACE_ID,
      ownId: () => SEED_APPLE_WORKSPACE_ID,
    },
  ])(
    'rejects a linked front component from a different $boundary',
    async ({ column, foreignId, ownId }) => {
      const menuItem = application.settingsMenuItems.find(
        ({ scope }) => scope === 'USER',
      );

      jestExpectToBeDefined(menuItem);

      const frontComponentId = menuItem.frontComponentId;

      await globalThis.testDataSource.query(
        `UPDATE core."frontComponent" SET "${column}" = $1 WHERE id = $2`,
        [foreignId, frontComponentId],
      );

      try {
        const { data, errors } = await myAppPreferencesSettingsMenuItems({
          input: {
            applicationUniversalIdentifier: application.universalIdentifier,
          },
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
          expectToFail: true,
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].extensions.code).toBe('NOT_FOUND');
        expect(data?.myAppPreferencesSettingsMenuItems).toBeUndefined();
      } finally {
        await globalThis.testDataSource.query(
          `UPDATE core."frontComponent" SET "${column}" = $1 WHERE id = $2`,
          [ownId(), frontComponentId],
        );
      }
    },
  );

  it('rejects and excludes a custom-only application after actual uninstall', async () => {
    const { errors: uninstallErrors } = await uninstallApplication({
      universalIdentifier: application.universalIdentifier,
    });
    const { data } = await myAppPreferencesApplications({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const { errors } = await myAppPreferencesSettingsMenuItems({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(uninstallErrors).toBeUndefined();
    expect(data.myAppPreferencesApplications.map(({ id }) => id)).not.toContain(
      application.id,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('NOT_FOUND');
  });
});
