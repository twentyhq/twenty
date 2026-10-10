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
import { v4 as uuidv4 } from 'uuid';

import { type ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const USER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = uuidv4();
const WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = uuidv4();
const USER_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER = uuidv4();
const WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER = uuidv4();

const APPLICATION_NAME = 'Application preferences A';

const findPreferencesOf = (
  applicationPreferences: ApplicationPreferencesDTO[],
  applicationId: string,
) =>
  applicationPreferences.find(
    (preferences) => preferences.applicationId === applicationId,
  );

describe('My application preferences should succeed', () => {
  let applicationId: string;
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
  });

  it('should give a member without the applications permission the user settings and defaults of every application that has some', async () => {
    const { data } = await myApplicationPreferences({
      input: {},
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const testedApplicationIds = [
      applicationId,
      otherUserApplication.id,
      workspaceOnlyApplication.id,
    ];

    expect(
      data.myApplicationPreferences.filter((preferences) =>
        testedApplicationIds.includes(preferences.applicationId),
      ),
    ).toEqual([
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
      },
      {
        applicationId: otherUserApplication.id,
        settingsMenuItems: [],
        variables: [{ key: 'RECORD_MY_MEETINGS', value: '', isSecret: false }],
      },
    ]);

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
