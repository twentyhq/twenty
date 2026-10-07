import {
  findApplicationRegistrationVariables,
  updateApplicationRegistrationVariable,
} from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const setupAppPreferencesConnectionApplication = async ({
  name,
  withUserVariable = false,
  configureCredentials = false,
}: {
  name: string;
  withUserVariable?: boolean;
  configureCredentials?: boolean;
}) => {
  const universalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const baseManifest = buildBaseManifest({
    appId: universalIdentifier,
    roleId: roleUniversalIdentifier,
  });

  await setupApplicationForSync({
    applicationUniversalIdentifier: universalIdentifier,
    name,
    description: name,
    sourcePath: `test-${universalIdentifier}`,
  });
  const { errors: syncErrors } = await syncApplication({
    manifest: {
      ...baseManifest,
      roles: baseManifest.roles.map((role) => ({
        ...role,
        label: `${name} ${roleUniversalIdentifier}`,
      })),
      application: {
        ...baseManifest.application,
        displayName: name,
        applicationVariables: withUserVariable
          ? {
              PREFERENCE: {
                universalIdentifier: uuidv4(),
                scope: 'USER',
                value: 'default',
              },
              SECOND_PREFERENCE: {
                universalIdentifier: uuidv4(),
                scope: 'USER',
              },
            }
          : {},
        serverVariables: {
          CLIENT_ID: {},
          CLIENT_SECRET: { isSecret: true },
        },
      },
      connectionProviders: [
        {
          universalIdentifier: uuidv4(),
          name: 'preferences',
          displayName: 'Preferences Provider',
          type: 'oauth',
          oauth: {
            authorizationEndpoint: 'https://example.com/oauth/authorize',
            tokenEndpoint: 'https://example.com/oauth/token',
            scopes: ['read'],
            clientIdVariable: 'CLIENT_ID',
            clientSecretVariable: 'CLIENT_SECRET',
          },
        },
      ],
    },
    expectToFail: false,
  });

  expect(syncErrors).toBeUndefined();
  jest.useRealTimers();

  const { data, errors } = await findOneApplication({
    input: { universalIdentifier },
    gqlFields: 'id applicationRegistrationId',
  });

  expect(errors).toBeUndefined();

  if (configureCredentials) {
    const applicationRegistrationId =
      data.findOneApplication.applicationRegistrationId;

    if (!isDefined(applicationRegistrationId)) {
      throw new Error('Test application has no registration');
    }

    const { data: variableData, errors: variableErrors } =
      await findApplicationRegistrationVariables({
        applicationRegistrationId,
      });

    expect(variableErrors).toBeUndefined();
    expect(variableData.findApplicationRegistrationVariables).toHaveLength(2);

    for (const variable of variableData.findApplicationRegistrationVariables) {
      const { errors: updateErrors } =
        await updateApplicationRegistrationVariable({
          id: variable.id,
          value: `synthetic-${variable.key.toLowerCase()}`,
        });

      expect(updateErrors).toBeUndefined();
    }
  }

  const [provider] =
    await findConnectionProvidersByApplication(universalIdentifier);

  return {
    id: data.findOneApplication.id,
    universalIdentifier,
    providerId: provider.id,
  };
};
