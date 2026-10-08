import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type Manifest,
  type SettingsMenuItemScope,
} from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { v4 as uuidv4 } from 'uuid';

export const setupAppPreferencesSettingsApplication = async ({
  name,
  scope = 'USER',
  withOtherCapabilities = false,
}: {
  name: string;
  scope?: SettingsMenuItemScope;
  withOtherCapabilities?: boolean;
}) => {
  const universalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const profileFrontComponentUniversalIdentifier = uuidv4();
  const recordingFrontComponentUniversalIdentifier = uuidv4();
  const workspaceFrontComponentUniversalIdentifier = uuidv4();
  const baseManifest = buildBaseManifest({
    appId: universalIdentifier,
    roleId: roleUniversalIdentifier,
  });
  const manifest: Manifest = {
    ...baseManifest,
    roles: baseManifest.roles.map((role) => ({
      ...role,
      label: `${name} ${roleUniversalIdentifier}`,
    })),
    application: {
      ...baseManifest.application,
      displayName: name,
      applicationVariables: withOtherCapabilities
        ? {
            PREFERENCE: {
              universalIdentifier: uuidv4(),
              scope: 'USER',
              value: 'default',
            },
          }
        : {},
      serverVariables: withOtherCapabilities
        ? { CLIENT_ID: {}, CLIENT_SECRET: { isSecret: true } }
        : {},
    },
    frontComponents: [
      {
        universalIdentifier: profileFrontComponentUniversalIdentifier,
        name: 'Profile Settings',
        sourceComponentPath: 'src/front-components/profile.tsx',
        builtComponentPath: 'src/front-components/profile.mjs',
        builtComponentChecksum: 'profile-checksum',
        componentName: 'ProfileSettings',
        isHeadless: false,
      },
      {
        universalIdentifier: recordingFrontComponentUniversalIdentifier,
        name: 'Recording Settings',
        sourceComponentPath: 'src/front-components/recording.tsx',
        builtComponentPath: 'src/front-components/recording.mjs',
        builtComponentChecksum: 'recording-checksum',
        componentName: 'RecordingSettings',
        isHeadless: false,
      },
      {
        universalIdentifier: workspaceFrontComponentUniversalIdentifier,
        name: 'Workspace Settings',
        sourceComponentPath: 'src/front-components/workspace.tsx',
        builtComponentPath: 'src/front-components/workspace.mjs',
        builtComponentChecksum: 'workspace-checksum',
        componentName: 'WorkspaceSettings',
        isHeadless: false,
      },
    ],
    settingsMenuItems: [
      {
        universalIdentifier: uuidv4(),
        frontComponentUniversalIdentifier:
          recordingFrontComponentUniversalIdentifier,
        title: 'Recording',
        icon: 'IconPlayerRecord',
        position: 2,
        scope,
      },
      {
        universalIdentifier: uuidv4(),
        frontComponentUniversalIdentifier:
          profileFrontComponentUniversalIdentifier,
        title: 'Profile',
        position: 1,
        scope,
      },
      {
        universalIdentifier: uuidv4(),
        frontComponentUniversalIdentifier:
          workspaceFrontComponentUniversalIdentifier,
        title: 'Workspace controls',
        position: 0,
        scope: 'WORKSPACE',
      },
    ],
    translations: {
      'fr-FR': {
        [generateMessageId('Profile', 'settingsMenuItem.title')]:
          'Profil personnel',
      },
    },
    connectionProviders: withOtherCapabilities
      ? [
          {
            universalIdentifier: uuidv4(),
            name: 'settings',
            displayName: 'Settings Provider',
            type: 'oauth',
            oauth: {
              authorizationEndpoint: 'https://example.com/oauth/authorize',
              tokenEndpoint: 'https://example.com/oauth/token',
              scopes: ['read'],
              clientIdVariable: 'CLIENT_ID',
              clientSecretVariable: 'CLIENT_SECRET',
            },
          },
        ]
      : [],
  };

  await setupApplicationForSync({
    applicationUniversalIdentifier: universalIdentifier,
    name,
    description: name,
    sourcePath: `test-${universalIdentifier}`,
  });
  jest.useRealTimers();

  for (const frontComponent of manifest.frontComponents) {
    const { errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: universalIdentifier,
      fileFolder: 'BuiltFrontComponent',
      filePath: frontComponent.builtComponentPath,
      fileBuffer: Buffer.from('export default function Settings() {}'),
      filename: `${frontComponent.componentName}.mjs`,
      contentType: 'application/javascript',
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }

  const { errors: syncErrors } = await syncApplication({
    manifest,
    expectToFail: false,
  });

  expect(syncErrors).toBeUndefined();
  jest.useRealTimers();

  const { data, errors } = await findOneApplication({
    input: { universalIdentifier },
    gqlFields:
      'id settingsMenuItems { id universalIdentifier title icon position scope frontComponentId }',
  });

  expect(errors).toBeUndefined();

  return {
    id: data.findOneApplication.id,
    universalIdentifier,
    settingsMenuItems: data.findOneApplication.settingsMenuItems ?? [],
    manifest,
  };
};
