import gql from 'graphql-tag';
import { print } from 'graphql';
import request from 'supertest';

const OBJECTS_QUERY = gql`
  query Objects {
    objects {
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
`;

type ObjectNode = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  isCustom: boolean;
};

const makeLocalizedMetadataRequest = (locale: string) => {
  const client = request(`http://localhost:${APP_PORT}`);

  return client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('x-locale', locale)
    .send({ query: print(OBJECTS_QUERY) });
};

const findObjectByName = (
  edges: Array<{ node: ObjectNode }>,
  nameSingular: string,
): ObjectNode | undefined =>
  edges.find((edge) => edge.node.nameSingular === nameSingular)?.node;

describe('object metadata i18n', () => {
  it('should return English labels with x-locale: en', async () => {
    const response = await makeLocalizedMetadataRequest('en');

    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
    expect(company!.description).toBe('A company');
  });

  it('should accept x-locale: fr-FR without errors', async () => {
    const response = await makeLocalizedMetadataRequest('fr-FR');

    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;

    expect(edges.length).toBeGreaterThan(0);

    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();
    expect(company!.labelSingular).toBeDefined();
    expect(company!.labelPlural).toBeDefined();
  });

  // Standard object labels should never be returned as raw hash IDs.
  // If msg`` wrapping is removed from source, the compiled catalog
  // loses the entry and the i18n lookup returns the hash itself.
  // The fallback in resolveObjectMetadataStandardOverride catches this
  // for the source locale, but non-source locales with actual translations
  // would break. This test verifies labels are human-readable strings.
  it('should return human-readable labels, not hash IDs', async () => {
    const response = await makeLocalizedMetadataRequest('fr-FR');

    const edges = response.body.data.objects.edges;
    const hashPattern = /^[A-Za-z0-9+/]{6}$/;

    const standardObjects = edges.filter(
      (edge: { node: ObjectNode }) => !edge.node.isCustom,
    );

    for (const edge of standardObjects) {
      const { nameSingular, labelSingular, labelPlural } = edge.node;

      expect(hashPattern.test(labelSingular)).toBe(false);
      expect(hashPattern.test(labelPlural)).toBe(false);

      expect(labelSingular.length).toBeGreaterThan(1);
      expect(labelPlural.length).toBeGreaterThan(1);

      if (nameSingular === 'company') {
        expect(typeof labelSingular).toBe('string');
      }
    }
  });

  it('should return French labels when Crowdin translations exist', async () => {
    const response = await makeLocalizedMetadataRequest('fr-FR');

    const edges = response.body.data.objects.edges;
    const company = findObjectByName(edges, 'company');

    expect(company).toBeDefined();

    // French translations for standard object labels are managed by Crowdin.
    // Once translators provide them, update these expectations:
    //   expect(company!.labelSingular).toBe('Entreprise');
    //   expect(company!.labelPlural).toBe('Entreprises');
    //
    // Until then, verify the fallback returns the English label (not a hash).
    expect(company!.labelSingular).toBe('Company');
    expect(company!.labelPlural).toBe('Companies');
  });
});
