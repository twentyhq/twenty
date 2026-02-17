import request from 'supertest';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        kind
        name
      }
    }
  }
`;

// Custom objects seeded in the dev workspace that should NOT appear
// in a schema scoped to the Twenty Standard Application
const CUSTOM_OBJECT_TYPE_NAMES = [
  'Rocket',
  'Pet',
  'PetCareAgreement',
  'SurveyResult',
  'EmploymentHistory',
];

const makeGraphqlIntrospectionRequest = async (
  token: string,
): Promise<request.Response> => {
  const client = request(`http://localhost:${APP_PORT}`);

  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query: INTROSPECTION_QUERY });

  return response;
};

describe('Application token schema filtering', () => {
  let standardAppToken: string;

  beforeAll(async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });

    const standardApp = applicationsData.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(standardApp).toBeDefined();

    const { data: tokenData } = await generateApplicationToken({
      applicationId: standardApp!.id,
      expectToFail: false,
    });

    standardAppToken =
      tokenData.generateApplicationToken.applicationAccessToken.token;
  });

  it('should not include custom objects in the schema when using a standard app token', async () => {
    const response = await makeGraphqlIntrospectionRequest(standardAppToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.__schema).toBeDefined();

    const typeNames: string[] = response.body.data.__schema.types.map(
      (type: { name: string }) => type.name,
    );

    for (const customTypeName of CUSTOM_OBJECT_TYPE_NAMES) {
      expect(typeNames).not.toContain(customTypeName);
      expect(typeNames).not.toContain(`${customTypeName}Edge`);
      expect(typeNames).not.toContain(`${customTypeName}Connection`);
    }
  });

  it('should include standard objects in the schema when using a standard app token', async () => {
    const response = await makeGraphqlIntrospectionRequest(standardAppToken);

    expect(response.body.errors).toBeUndefined();

    const typeNames: string[] = response.body.data.__schema.types.map(
      (type: { name: string }) => type.name,
    );

    expect(typeNames).toContain('Person');
    expect(typeNames).toContain('Company');
    expect(typeNames).toContain('Opportunity');
  });
});
