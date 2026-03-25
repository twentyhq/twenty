import request from 'supertest';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const objectsQuery = {
  query: `
    query ObjectsI18n {
      objects(paging: { first: 100 }) {
        edges {
          node {
            nameSingular
            labelSingular
            labelPlural
            description
            isCustom
          }
        }
      }
    }
  `,
};

type ObjectNode = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  isCustom: boolean;
};

const updateWorkspaceMemberLocale = async (locale: string) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation UpdateWorkspaceMember(
          $workspaceMemberId: UUID!
          $data: WorkspaceMemberUpdateInput!
        ) {
          updateWorkspaceMember(id: $workspaceMemberId, data: $data) {
            id
            locale
          }
        }
      `,
      variables: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        data: { locale },
      },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.updateWorkspaceMember.locale).toBe(locale);
};

const queryMetadataObjects = () =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send(objectsQuery);

const findObjectByName = (
  edges: Array<{ node: ObjectNode }>,
  nameSingular: string,
): ObjectNode | undefined =>
  edges.find((edge) => edge.node.nameSingular === nameSingular)?.node;

describe('object metadata i18n', () => {
  afterAll(async () => {
    await updateWorkspaceMemberLocale('en');
  });

  it('should return English labels when user locale is en', async () => {
    const response = await queryMetadataObjects();

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
    expect(company!.description).toBe('A company');
  });

  it('should return French labels when user locale is fr-FR', async () => {
    await updateWorkspaceMemberLocale('fr-FR');

    const response = await queryMetadataObjects();

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');
    const person = findObjectByName(edges, 'person');
    const opportunity = findObjectByName(edges, 'opportunity');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Entreprise');
    expect(company!.labelPlural).toBe('Entreprises');
    expect(company!.description).toBe('Une entreprise');

    expect(person).toBeDefined();
    expect(person!.labelSingular).toBe('Personne');
    expect(person!.labelPlural).toBe('Personnes');
    expect(person!.description).toBe('Une personne');

    expect(opportunity).toBeDefined();
    expect(opportunity!.labelSingular).toBe('Opportunité');
    expect(opportunity!.labelPlural).toBe('Opportunités');
    expect(opportunity!.description).toBe('Une opportunité');
  });
});
