import request from 'supertest';

import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import {
  extractMetadataItemPayload,
  extractMetadataListPayload,
} from 'test/integration/rest/utils/metadata-rest-api.util';
import { assertRestApiSuccessfulResponse } from 'test/integration/rest/utils/rest-test-assertions.util';

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
};

type RestFieldShape = { id: string; name: string; label: string };

type RestObjectShape = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  fields: RestFieldShape[];
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

  describe('REST metadata API', () => {
    beforeAll(async () => {
      await updateWorkspaceMemberLocale('fr-FR');
    });

    it('should return French labels from GET /metadata/objects', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=200',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);

      const { items } = extractMetadataListPayload<RestObjectShape>(
        response.body,
        'objects',
      );
      const person = items.find((item) => item.nameSingular === 'person');

      expect(person).toBeDefined();
      expect(person!.labelSingular).toBe('Personne');
      expect(person!.labelPlural).toBe('Personnes');
      expect(person!.description).toBe('Une personne');
    });

    it('should return French labels on the fields inlined by GET /metadata/objects', async () => {
      const response = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=200',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);

      const { items } = extractMetadataListPayload<RestObjectShape>(
        response.body,
        'objects',
      );
      const person = items.find((item) => item.nameSingular === 'person');
      // A field only reachable through person proves the inlined fields were
      // regrouped onto the object they belong to, not merely onto some object.
      const companyField = person?.fields.find(
        (field) => field.name === 'company',
      );

      expect(companyField).toBeDefined();
      expect(companyField!.label).toBe('Entreprise');
    });

    it('should return French labels from GET /metadata/fields/:id', async () => {
      const objectsResponse = await makeRestAPIRequest({
        method: 'get',
        path: '/metadata/objects?limit=200',
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(objectsResponse);

      const { items } = extractMetadataListPayload<RestObjectShape>(
        objectsResponse.body,
        'objects',
      );
      const companyField = items
        .find((item) => item.nameSingular === 'person')
        ?.fields.find((field) => field.name === 'company');

      expect(companyField).toBeDefined();

      const response = await makeRestAPIRequest({
        method: 'get',
        path: `/metadata/fields/${companyField!.id}`,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      assertRestApiSuccessfulResponse(response);

      expect(
        extractMetadataItemPayload<RestFieldShape>(response.body, 'field')
          .label,
      ).toBe('Entreprise');
    });
  });
});
