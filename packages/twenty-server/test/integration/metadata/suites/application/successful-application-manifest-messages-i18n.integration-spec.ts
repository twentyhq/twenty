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
const SKILL_UNIVERSAL_IDENTIFIER = uuidv4();
const PERMISSION_FLAG_UNIVERSAL_IDENTIFIER = uuidv4();

type VariableWithTexts = {
  key: string;
  label?: string;
  description: string;
  options: ApplicationVariableOption[] | null;
};

const FRENCH_TRANSLATIONS = {
  [generateMessageId('Postcards', 'application.displayName')]:
    'Cartes postales',
  [generateMessageId('Send postcards to contacts', 'application.description')]:
    'Envoyer des cartes postales',
  [generateMessageId('Region', 'applicationVariable.label')]: 'Région',
  [generateMessageId(
    'Default shipping region',
    'applicationVariable.description',
  )]: "Région d'expédition par défaut",
  [generateMessageId('Europe', 'applicationVariable.label')]: 'Europe (FR)',
  [generateMessageId('Delivery speed', 'serverVariable.description')]:
    'Vitesse de livraison',
  [generateMessageId('Express', 'serverVariable.label')]: 'Rapide',
  [generateMessageId('Postcard sender', 'role.label')]: 'Expéditeur',
  [generateMessageId('Sends postcards', 'role.description')]:
    'Envoie des cartes postales',
  [generateMessageId('Postcard writing', 'skill.label')]: 'Rédaction de cartes',
  [generateMessageId('Send postcards', 'permissionFlag.label')]:
    'Envoyer des cartes',
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

const findApplicationTexts = async () => {
  const { data } = await findOneApplication({
    input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    gqlFields: `
      name
      description
      applicationVariables {
        key
        label
        description
        options
      }
    `,
    expectToFail: false,
  });
  const region = (
    data.findOneApplication.applicationVariables as VariableWithTexts[]
  ).find(({ key }) => key === 'REGION');

  return {
    name: data.findOneApplication.name,
    description: data.findOneApplication.description,
    regionLabel: region?.label,
    regionDescription: region?.description,
    regionOptionLabels: region?.options?.map(({ label }) => label),
  };
};

const findServerVariableTexts = async (applicationRegistrationId: string) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query FindApplicationRegistrationVariables(
        $applicationRegistrationId: String!
      ) {
        findApplicationRegistrationVariables(
          applicationRegistrationId: $applicationRegistrationId
        ) {
          key
          description
          options
        }
      }
    `,
    variables: { applicationRegistrationId },
  });

  expect(response.body.errors).toBeUndefined();

  const deliverySpeed = (
    response.body.data
      .findApplicationRegistrationVariables as VariableWithTexts[]
  ).find(({ key }) => key === 'DELIVERY_SPEED');

  return {
    description: deliverySpeed?.description,
    optionLabels: deliverySpeed?.options?.map(({ label }) => label),
  };
};

const SKILL_NAME = 'postcard-writing';

type EntityTexts = {
  universalIdentifier?: string;
  name?: string;
  label: string;
  description?: string;
};

const findEntityTexts = async () => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query FindApplicationEntityTexts {
        getRoles {
          universalIdentifier
          label
          description
        }
        skills {
          name
          label
        }
        getPermissionFlags {
          universalIdentifier
          label
        }
      }
    `,
  });

  expect(response.body.errors).toBeUndefined();

  const roles: EntityTexts[] = response.body.data.getRoles;
  const skills: EntityTexts[] = response.body.data.skills;
  const permissionFlags: EntityTexts[] = response.body.data.getPermissionFlags;
  const role = roles.find(
    ({ universalIdentifier }) =>
      universalIdentifier === ROLE_UNIVERSAL_IDENTIFIER,
  );

  return {
    roleLabel: role?.label,
    roleDescription: role?.description,
    skillLabel: skills.find(({ name }) => name === SKILL_NAME)?.label,
    permissionFlagLabel: permissionFlags.find(
      ({ universalIdentifier }) =>
        universalIdentifier === PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    )?.label,
  };
};

describe('application manifest messages i18n', () => {
  let applicationRegistrationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Postcards',
      description: 'Send postcards to contacts',
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
            displayName: 'Postcards',
            description: 'Send postcards to contacts',
            applicationVariables: {
              REGION: {
                universalIdentifier: uuidv4(),
                label: 'Region',
                description: 'Default shipping region',
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
                description: 'Delivery speed',
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
          roles: [
            {
              universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
              label: 'Postcard sender',
              description: 'Sends postcards',
            },
          ],
          skills: [
            {
              universalIdentifier: SKILL_UNIVERSAL_IDENTIFIER,
              name: SKILL_NAME,
              label: 'Postcard writing',
              content: '# Postcard writing',
            },
          ],
          permissionFlags: [
            {
              universalIdentifier: PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
              key: 'SEND_POSTCARDS',
              label: 'Send postcards',
              permissionType: 'settings',
            },
          ],
          translations: { 'fr-FR': FRENCH_TRANSLATIONS },
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

  it('should translate application texts and application variables to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findApplicationTexts()).toEqual({
      name: 'Cartes postales',
      description: 'Envoyer des cartes postales',
      regionLabel: 'Région',
      regionDescription: "Région d'expédition par défaut",
      regionOptionLabels: ['Europe (FR)', 'Asia'],
    });

    await updateWorkspaceMemberLocale('en');

    expect(await findApplicationTexts()).toEqual({
      name: 'Postcards',
      description: 'Send postcards to contacts',
      regionLabel: 'Region',
      regionDescription: 'Default shipping region',
      regionOptionLabels: ['Europe', 'Asia'],
    });
  });

  it('should translate server variable texts to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findServerVariableTexts(applicationRegistrationId)).toEqual({
      description: 'Vitesse de livraison',
      optionLabels: ['Standard', 'Rapide'],
    });

    await updateWorkspaceMemberLocale('en');

    expect(await findServerVariableTexts(applicationRegistrationId)).toEqual({
      description: 'Delivery speed',
      optionLabels: ['Standard', 'Express'],
    });
  });

  it('should translate role, skill and permission flag texts to the member locale', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    expect(await findEntityTexts()).toEqual({
      roleLabel: 'Expéditeur',
      roleDescription: 'Envoie des cartes postales',
      skillLabel: 'Rédaction de cartes',
      permissionFlagLabel: 'Envoyer des cartes',
    });

    await updateWorkspaceMemberLocale('en');

    expect(await findEntityTexts()).toEqual({
      roleLabel: 'Postcard sender',
      roleDescription: 'Sends postcards',
      skillLabel: 'Postcard writing',
      permissionFlagLabel: 'Send postcards',
    });
  });
});
