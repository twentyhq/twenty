import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildFrontComponentManifest } from 'test/integration/metadata/suites/application/utils/build-front-component-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { uploadBuiltFrontComponentFile } from 'test/integration/metadata/suites/application/utils/upload-built-front-component-file.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { type ConnectionProviderManifest } from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const USER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = uuidv4();
const WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = uuidv4();
const USER_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER = uuidv4();
const WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER = uuidv4();

const CONNECTION_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const CONNECTION_ONLY_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

const APPLICATION_NAME = 'Application preferences A';

const buildOAuthConnectionProvider = ({
  name,
  displayName,
  scope,
  logo,
}: Pick<
  ConnectionProviderManifest,
  'name' | 'displayName' | 'scope' | 'logo'
>): ConnectionProviderManifest => ({
  universalIdentifier: uuidv4(),
  name,
  displayName,
  type: 'oauth',
  scope,
  logo,
  oauth: {
    authorizationEndpoint: `https://${name}.example.com/oauth/authorize`,
    tokenEndpoint: `https://${name}.example.com/oauth/token`,
    scopes: ['read'],
    clientIdVariable: `${name.toUpperCase()}_CLIENT_ID`,
    clientSecretVariable: `${name.toUpperCase()}_CLIENT_SECRET`,
  },
});

const buildExpectedUserConnectionProvider = ({
  name,
  displayName,
  logoUrl = null,
}: {
  name: string;
  displayName: string;
  logoUrl?: string | null;
}) => ({
  id: expect.any(String),
  name,
  displayName,
  scope: 'USER',
  type: 'oauth',
  logoUrl,
  oauth: { scopes: ['read'], isClientCredentialsConfigured: false },
});

const findPreferencesOf = (
  applicationPreferences: ApplicationPreferencesDTO[],
  applicationId: string,
) =>
  applicationPreferences.find(
    (preferences) => preferences.applicationId === applicationId,
  );

const sortByApplicationId = <PreferencesLike extends { applicationId: string }>(
  preferences: PreferencesLike[],
): PreferencesLike[] =>
  [...preferences].sort((preferencesA, preferencesB) =>
    preferencesA.applicationId.localeCompare(preferencesB.applicationId),
  );

describe('My application preferences should succeed', () => {
  let applicationId: string;
  let connectionOnlyApplicationId: string;
  let otherUserApplication: ApplicationWithVariable;
  let workspaceOnlyApplication: ApplicationWithVariable;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: APPLICATION_NAME,
      description: 'App for testing application preferences',
      sourcePath: 'application-preferences',
    });

    // setupApplicationForSync leaves fake timers installed, under which the
    // multipart upload never resolves.
    jest.useRealTimers();

    await uploadBuiltFrontComponentFile({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      componentName: 'UserSettings',
    });
    await uploadBuiltFrontComponentFile({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      componentName: 'WorkspaceSettings',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          application: {
            universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            defaultRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
            displayName: APPLICATION_NAME,
            description: 'App for testing application preferences',
            applicationVariables: {
              PERSONAL_API_KEY: {
                universalIdentifier: uuidv4(),
                scope: 'USER',
                isSecret: true,
              },
              LANGUAGE: {
                universalIdentifier: uuidv4(),
                scope: 'USER',
                value: 'en',
              },
              WORKSPACE_URL: {
                universalIdentifier: uuidv4(),
                value: 'https://example.com',
              },
            },
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
          frontComponents: [
            buildFrontComponentManifest({
              universalIdentifier: USER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
              componentName: 'UserSettings',
            }),
            buildFrontComponentManifest({
              universalIdentifier:
                WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
              componentName: 'WorkspaceSettings',
            }),
          ],
          settingsMenuItems: [
            {
              universalIdentifier: USER_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
              frontComponentUniversalIdentifier:
                USER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
              title: 'My settings',
              icon: 'IconUser',
              position: 1,
              scope: 'USER',
            },
            {
              universalIdentifier:
                WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
              frontComponentUniversalIdentifier:
                WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
              title: 'Workspace settings',
              position: 2,
            },
          ],
          connectionProviders: [
            buildOAuthConnectionProvider({
              name: 'linear',
              displayName: 'Linear',
              scope: 'USER',
            }),
            buildOAuthConnectionProvider({
              name: 'slack',
              displayName: 'Slack',
              scope: 'WORKSPACE',
            }),
          ],
        },
      }),
      expectToFail: false,
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;

    otherUserApplication = await setupApplicationWithVariable({
      name: 'Application preferences B',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    workspaceOnlyApplication = await setupApplicationWithVariable({
      name: 'Application preferences C',
      variableKey: 'RECORD_ALL_MEETINGS',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier:
        CONNECTION_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Application preferences D',
      description: 'App whose only user preference is a connection',
      sourcePath: 'application-preferences-connection-only',
    });
    await syncApplication({
      manifest: buildBaseManifest({
        appId: CONNECTION_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: CONNECTION_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          roles: [
            {
              universalIdentifier: CONNECTION_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
              label: 'Application preferences D role',
              description: 'A test role',
            },
          ],
          connectionProviders: [
            buildOAuthConnectionProvider({
              name: 'github',
              displayName: 'GitHub',
              scope: 'USER',
              logo: 'public/github-logomark.svg',
            }),
          ],
        },
      }),
      expectToFail: false,
    });
    jest.useRealTimers();

    const { data: connectionOnlyApplicationData } = await findOneApplication({
      input: {
        universalIdentifier: CONNECTION_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      gqlFields: 'id',
      expectToFail: false,
    });

    connectionOnlyApplicationId =
      connectionOnlyApplicationData.findOneApplication.id;
  }, 180000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: otherUserApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        workspaceOnlyApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        CONNECTION_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should give a member without the Workspace Apps permission the user settings and defaults of every application that has some', async () => {
    const { data } = await myApplicationPreferences({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const testedApplicationIds = [
      applicationId,
      otherUserApplication.id,
      workspaceOnlyApplication.id,
      connectionOnlyApplicationId,
    ];

    expect(
      sortByApplicationId(
        data.myApplicationPreferences.filter((preferences) =>
          testedApplicationIds.includes(preferences.applicationId),
        ),
      ),
    ).toEqual(
      sortByApplicationId([
        {
          applicationId,
          settingsMenuItems: [
            {
              id: expect.any(String),
              universalIdentifier: USER_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
              applicationId,
              frontComponentId: expect.any(String),
              title: 'My settings',
              icon: 'IconUser',
              position: 1,
              scope: 'USER',
            },
          ],
          variables: expect.arrayContaining([
            { key: 'PERSONAL_API_KEY', value: '', isSecret: true },
            { key: 'LANGUAGE', value: 'en', isSecret: false },
          ]),
          connectionProviders: [
            buildExpectedUserConnectionProvider({
              name: 'linear',
              displayName: 'Linear',
            }),
          ],
        },
        {
          applicationId: otherUserApplication.id,
          settingsMenuItems: [],
          variables: [
            { key: 'RECORD_MY_MEETINGS', value: '', isSecret: false },
          ],
          connectionProviders: [],
        },
        {
          applicationId: connectionOnlyApplicationId,
          settingsMenuItems: [],
          variables: [],
          connectionProviders: [
            buildExpectedUserConnectionProvider({
              name: 'github',
              displayName: 'GitHub',
              logoUrl: `${process.env.SERVER_URL ?? new ConfigVariables().SERVER_URL}/public-assets/${SEED_APPLE_WORKSPACE_ID}/${connectionOnlyApplicationId}/public/github-logomark.svg`,
            }),
          ],
        },
      ]),
    );

    expect(
      findPreferencesOf(data.myApplicationPreferences, applicationId)
        ?.variables,
    ).toHaveLength(2);
  });

  it('should return only the own values, with secrets masked, as soon as they are saved', async () => {
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'PERSONAL_API_KEY',
        value: 'jony-key',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'fr',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });
    await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        key: 'LANGUAGE',
        value: 'de',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data: jonyData } = await myApplicationPreferences({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(
      findPreferencesOf(jonyData.myApplicationPreferences, applicationId)
        ?.variables,
    ).toEqual(
      expect.arrayContaining([
        {
          key: 'PERSONAL_API_KEY',
          value: SECRET_APPLICATION_VARIABLE_MASK,
          isSecret: true,
        },
        { key: 'LANGUAGE', value: 'fr', isSecret: false },
      ]),
    );

    const { data: janeData } = await myApplicationPreferences({
      input: {},
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(
      findPreferencesOf(janeData.myApplicationPreferences, applicationId)
        ?.variables,
    ).toEqual(
      expect.arrayContaining([
        { key: 'PERSONAL_API_KEY', value: '', isSecret: true },
        { key: 'LANGUAGE', value: 'de', isSecret: false },
      ]),
    );
  });
});

describe('My application preferences should list a workspace provider for its personal connections', () => {
  const LEGACY_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
  const LEGACY_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
  let legacyApplicationId: string;

  const insertConnection = async ({
    connectionProviderId,
    userWorkspaceId,
    scope,
  }: {
    connectionProviderId: string;
    userWorkspaceId: string;
    scope: 'USER' | 'WORKSPACE';
  }) =>
    globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        `${uuidv4()}@legacy.test`,
        ConnectedAccountProvider.APP,
        scope,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        legacyApplicationId,
        connectionProviderId,
      ],
    );

  const findLegacyProviderNames = async (token: string) => {
    const { data } = await myApplicationPreferences({
      input: {},
      token,
      expectToFail: false,
    });

    return findPreferencesOf(
      data.myApplicationPreferences,
      legacyApplicationId,
    )?.connectionProviders.map(({ name, scope }) => ({ name, scope }));
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: LEGACY_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Application preferences E',
      description: 'App whose workspace providers hold legacy connections',
      sourcePath: 'application-preferences-legacy-personal-connections',
    });
    await syncApplication({
      manifest: buildBaseManifest({
        appId: LEGACY_APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: LEGACY_ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          roles: [
            {
              universalIdentifier: LEGACY_ROLE_UNIVERSAL_IDENTIFIER,
              label: 'Application preferences E role',
              description: 'A test role',
            },
          ],
          connectionProviders: [
            buildOAuthConnectionProvider({
              name: 'notion',
              displayName: 'Notion',
              scope: 'WORKSPACE',
            }),
            buildOAuthConnectionProvider({
              name: 'asana',
              displayName: 'Asana',
              scope: 'WORKSPACE',
            }),
          ],
        },
      }),
      expectToFail: false,
    });
    jest.useRealTimers();

    const providers = await findConnectionProvidersByApplication(
      LEGACY_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    const notionProviderId = providers.find(
      ({ name }) => name === 'notion',
    )?.id;
    const asanaProviderId = providers.find(({ name }) => name === 'asana')?.id;

    assertIsDefinedOrThrow(notionProviderId);
    assertIsDefinedOrThrow(asanaProviderId);

    legacyApplicationId = providers[0].applicationId;

    await insertConnection({
      connectionProviderId: notionProviderId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      scope: 'USER',
    });
    await insertConnection({
      connectionProviderId: asanaProviderId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      scope: 'WORKSPACE',
    });
    await insertConnection({
      connectionProviderId: asanaProviderId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      scope: 'USER',
    });
  }, 180000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [legacyApplicationId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: LEGACY_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should list only the workspace providers holding the caller own personal connections', async () => {
    expect(
      await findLegacyProviderNames(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toEqual([{ name: 'notion', scope: 'WORKSPACE' }]);
    expect(
      await findLegacyProviderNames(APPLE_JANE_ADMIN_ACCESS_TOKEN),
    ).toEqual([{ name: 'asana', scope: 'WORKSPACE' }]);
  });
});
