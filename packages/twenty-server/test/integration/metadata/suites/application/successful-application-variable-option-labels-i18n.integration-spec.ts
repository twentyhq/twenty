import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findApplicationRegistrationByUniversalIdentifier } from 'test/integration/metadata/suites/application/utils/find-application-registration-by-universal-identifier.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type ApplicationVariableOption } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

type VariableWithOptions = {
  key: string;
  options: ApplicationVariableOption[] | null;
};

const updateWorkspaceMemberLocale = async (locale: string) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      mutation UpdateWorkspaceMemberSettings(
        $input: UpdateWorkspaceMemberSettingsInput!
      ) {
        updateWorkspaceMemberSettings(input: $input)
      }
    `,
    variables: {
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        update: { locale },
      },
    },
  });

  expect(response.body.errors).toBeUndefined();
};

const getOptionLabels = (
  variables: VariableWithOptions[],
  key: string,
): string[] | undefined =>
  variables
    .find((variable) => variable.key === key)
    ?.options?.map(({ label }) => label);

const findApplicationVariableOptionLabels = async () => {
  const { data } = await findOneApplication({
    input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    gqlFields: `
      applicationVariables {
        key
        options
      }
    `,
    expectToFail: false,
  });

  return getOptionLabels(
    data.findOneApplication.applicationVariables as VariableWithOptions[],
    'REGION',
  );
};

const findServerVariableOptionLabels = async (
  applicationRegistrationId: string,
) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query FindApplicationRegistrationVariables(
        $applicationRegistrationId: String!
      ) {
        findApplicationRegistrationVariables(
          applicationRegistrationId: $applicationRegistrationId
        ) {
          key
          options
        }
      }
    `,
    variables: { applicationRegistrationId },
  });

  expect(response.body.errors).toBeUndefined();

  return getOptionLabels(
    response.body.data.findApplicationRegistrationVariables,
    'DELIVERY_SPEED',
  );
};

describe('application variable option labels i18n', () => {
  let applicationRegistrationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Option labels i18n app',
      description: 'Option labels i18n app',
      sourcePath: `test-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          application: {
            universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            defaultRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
            displayName: 'Option labels i18n app',
            description: 'Option labels i18n app',
            applicationVariables: {
              REGION: {
                universalIdentifier: uuidv4(),
                type: FieldMetadataType.SELECT,
                options: [
                  { label: 'Europe', value: 'eu' },
                  { label: 'Asia', value: 'apac' },
                ],
                value: 'eu',
              },
            },
            serverVariables: {
              DELIVERY_SPEED: {
                type: FieldMetadataType.SELECT,
                options: [
                  { label: 'Standard', value: 'standard' },
                  { label: 'Express', value: 'express' },
                ],
              },
            },
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
          translations: {
            'fr-FR': {
              [generateMessageId('Europe', 'applicationVariable.label')]:
                'Europe (FR)',
              [generateMessageId('Express', 'serverVariable.label')]: 'Rapide',
            },
          },
        },
      }),
      expectToFail: false,
    });

    const applicationRegistration =
      await findApplicationRegistrationByUniversalIdentifier({
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    jestExpectToBeDefined(applicationRegistration);
    applicationRegistrationId = applicationRegistration.id;
  });

  afterAll(async () => {
    await updateWorkspaceMemberLocale('en');
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should translate application variable option labels to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findApplicationVariableOptionLabels()).toEqual([
      'Europe (FR)',
      'Asia',
    ]);

    await updateWorkspaceMemberLocale('en');

    expect(await findApplicationVariableOptionLabels()).toEqual([
      'Europe',
      'Asia',
    ]);
  });

  it('should translate server variable option labels to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    expect(
      await findServerVariableOptionLabels(applicationRegistrationId),
    ).toEqual(['Standard', 'Rapide']);

    await updateWorkspaceMemberLocale('en');

    expect(
      await findServerVariableOptionLabels(applicationRegistrationId),
    ).toEqual(['Standard', 'Express']);
  });
});
