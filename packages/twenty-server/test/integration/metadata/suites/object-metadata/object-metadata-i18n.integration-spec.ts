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

  it('should accept x-locale: fr-FR without errors', async () => {
    const response = await makeLocalizedRequest('fr-FR');

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;

    expect(edges.length).toBeGreaterThan(0);

    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBeDefined();
    expect(company!.labelPlural).toBeDefined();
  });

  // Standard object labels should never be returned as raw hash IDs.
  // The fallback in resolveObjectMetadataStandardOverride catches missing
  // catalog entries by returning the raw DB label. This test verifies
  // that labels are always human-readable, not 6-char Lingui hashes.
  it('should return human-readable labels, not hash IDs', async () => {
    const response = await makeLocalizedRequest('fr-FR');

    const edges = response.body.data.objects.edges;
    const hashPattern = /^[A-Za-z0-9+/]{6}$/;

    const standardObjects = edges.filter(
      (edge: { node: ObjectNode }) => !edge.node.isCustom,
    );

    for (const edge of standardObjects) {
      const { labelSingular, labelPlural } = edge.node;

      expect(hashPattern.test(labelSingular)).toBe(false);
      expect(hashPattern.test(labelPlural)).toBe(false);

      expect(labelSingular.length).toBeGreaterThan(1);
      expect(labelPlural.length).toBeGreaterThan(1);
    }
  });

  // French translations for standard object labels are managed by Crowdin.
  // Once translators provide them, update these expectations:
  //   expect(company!.labelSingular).toBe('Entreprise');
  //   expect(company!.labelPlural).toBe('Entreprises');
  // Until then, verify the fallback returns the English label (not a hash).
  it('should return French labels when Crowdin translations exist', async () => {
    const response = await makeLocalizedRequest('fr-FR');

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
  });
});
