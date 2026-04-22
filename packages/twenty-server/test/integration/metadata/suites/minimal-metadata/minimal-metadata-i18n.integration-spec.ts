import request from 'supertest';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const minimalMetadataQuery = {
  query: `
    query MinimalMetadataI18n {
      minimalMetadata {
        objectMetadataItems {
          nameSingular
          labelSingular
          labelPlural
          isCustom
        }
      }
    }
  `,
};

type MinimalObjectItem = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  isCustom: boolean;
};

const updateWorkspaceMemberLocale = async (locale: string) => {
  const response = await client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
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
  expect(response.body.data.updateWorkspaceMemberSettings).toBe(true);
};

const queryMinimalMetadata = () =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send(minimalMetadataQuery);

const findObjectByName = (
  items: MinimalObjectItem[],
  nameSingular: string,
): MinimalObjectItem | undefined =>
  items.find((item) => item.nameSingular === nameSingular);

describe('minimalMetadata i18n', () => {
  afterAll(async () => {
    await updateWorkspaceMemberLocale('en');
  });

  it('should return English labels when user locale is en', async () => {
    await updateWorkspaceMemberLocale('en');

    const response = await queryMinimalMetadata();

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const { objectMetadataItems } = response.body.data.minimalMetadata;
    const company = findObjectByName(objectMetadataItems, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
  });

  it('should return French labels when user locale is fr-FR', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    const response = await queryMinimalMetadata();

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const { objectMetadataItems } = response.body.data.minimalMetadata;
    const company = findObjectByName(objectMetadataItems, 'company');
    const person = findObjectByName(objectMetadataItems, 'person');
    const opportunity = findObjectByName(objectMetadataItems, 'opportunity');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Entreprise');
    expect(company!.labelPlural).toBe('Entreprises');

    expect(person).toBeDefined();
    expect(person!.labelSingular).toBe('Personne');
    expect(person!.labelPlural).toBe('Personnes');

    expect(opportunity).toBeDefined();
    expect(opportunity!.labelSingular).toBe('Opportunité');
    expect(opportunity!.labelPlural).toBe('Opportunités');
  });
});
