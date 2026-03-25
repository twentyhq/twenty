import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const queryData = {
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

const makeLocalizedRequest = (locale: string) =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('x-locale', locale)
    .send(queryData);

const findObjectByName = (
  edges: Array<{ node: ObjectNode }>,
  nameSingular: string,
): ObjectNode | undefined =>
  edges.find((edge) => edge.node.nameSingular === nameSingular)?.node;

describe('object metadata i18n', () => {
  it('should return English labels with x-locale: en', async () => {
    const response = await makeLocalizedRequest('en');

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
    expect(company!.description).toBe('A company');
  });

  it('should return French labels with x-locale: fr-FR', async () => {
    const response = await makeLocalizedRequest('fr-FR');

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
