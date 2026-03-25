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

  it('should return localized labels with x-locale: fr-FR', async () => {
    const response = await makeLocalizedRequest('fr-FR');

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;

    expect(edges.length).toBeGreaterThan(0);

    const company = findObjectByName(edges, 'company');
    const person = findObjectByName(edges, 'person');

    expect(company).toBeDefined();
    expect(person).toBeDefined();

    // These labels come from the Lingui catalog resolved via
    // resolveObjectMetadataStandardOverride. When Crowdin translations
    // are synced, these will return French (e.g. "Entreprise").
    // The fallback returns the English source text, never a raw hash ID.
    expect(company!.labelSingular).toMatch(/^(Company|Entreprise)$/);
    expect(company!.labelPlural).toMatch(/^(Companies|Entreprises)$/);
    expect(person!.labelSingular).toMatch(/^(Person|Personne)$/);
    expect(person!.labelPlural).toMatch(/^(People|Personnes)$/);
  });

  it('should return human-readable labels for all standard objects', async () => {
    const enResponse = await makeLocalizedRequest('en');
    const frResponse = await makeLocalizedRequest('fr-FR');

    const enEdges = enResponse.body.data.objects.edges;
    const frEdges = frResponse.body.data.objects.edges;

    const enStandard = enEdges
      .filter((edge: { node: ObjectNode }) => !edge.node.isCustom)
      .map((edge: { node: ObjectNode }) => edge.node);
    const frStandard = frEdges
      .filter((edge: { node: ObjectNode }) => !edge.node.isCustom)
      .map((edge: { node: ObjectNode }) => edge.node);

    expect(enStandard.length).toBeGreaterThan(0);
    expect(enStandard.length).toBe(frStandard.length);

    for (const enObject of enStandard) {
      const frObject = frStandard.find(
        (object: ObjectNode) => object.nameSingular === enObject.nameSingular,
      );

      expect(frObject).toBeDefined();
      expect(frObject.labelSingular.length).toBeGreaterThan(1);
      expect(frObject.labelPlural.length).toBeGreaterThan(1);
    }
  });
});
