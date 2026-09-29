import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

// Custom objects seeded in the dev workspace, owned by the workspace custom
// application rather than the Twenty Standard one.
const WORKSPACE_CUSTOM_OBJECT_TYPE_NAMES = ['Rocket', 'Pet', 'SurveyResult'];

const APPLICATION_CORE_GRAPHQL_SCHEMA = gql`
  query ApplicationCoreGraphqlSchema($applicationUniversalIdentifier: String!) {
    applicationCoreGraphqlSchema(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
    )
  }
`;

const getStandardApplicationSchema = async (token?: string) => {
  const response = await makeMetadataApiRequest(
    {
      query: APPLICATION_CORE_GRAPHQL_SCHEMA,
      variables: {
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
    },
    token,
  );

  return response.body;
};

describe('applicationCoreGraphqlSchema', () => {
  it('scopes the schema to the application without an application token', async () => {
    const body = await getStandardApplicationSchema();

    expect(body.errors).toBeUndefined();

    const schema: string = body.data.applicationCoreGraphqlSchema;

    expect(schema).toContain('type Person');
    expect(schema).toContain('type Company');

    for (const customTypeName of WORKSPACE_CUSTOM_OBJECT_TYPE_NAMES) {
      expect(schema).not.toContain(`type ${customTypeName} `);
    }
  });

  it('is reachable with an API key', async () => {
    const body = await getStandardApplicationSchema(API_KEY_ACCESS_TOKEN);

    expect(body.errors).toBeUndefined();
    expect(body.data.applicationCoreGraphqlSchema).toContain('type Person');
  });

  it('fails for an unknown application', async () => {
    const response = await makeMetadataApiRequest({
      query: APPLICATION_CORE_GRAPHQL_SCHEMA,
      variables: {
        applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000000',
      },
    });

    expect(response.body.errors).toBeDefined();
  });
});
