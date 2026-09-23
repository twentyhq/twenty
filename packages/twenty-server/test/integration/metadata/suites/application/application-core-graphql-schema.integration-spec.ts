import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { buildCoreWorkflowAppOperationsSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/build-core-workflow-app-operations-sdl.util';
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

const FULL_SCHEMA_INTROSPECTION = gql`
  query FullSchemaTypeNames {
    __schema {
      types {
        name
      }
    }
  }
`;

const collectTypeNames = (sdl: string): string[] =>
  Array.from(sdl.matchAll(/^type (\w+)/gm)).map(([, typeName]) => typeName);

const getStandardApplicationSchema = async (token?: string) => {
  const response = await makeMetadataAPIRequest(
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

  it('returns a subset of what the caller can already introspect', async () => {
    // The application SDL also carries the core workflow operations, which no
    // endpoint serves as such, so they are read from the builder the server
    // appends them with.
    const [scopedBody, fullSchemaResponse, coreWorkflowOperationsSdl] =
      await Promise.all([
        getStandardApplicationSchema(),
        makeGraphqlAPIRequest({ query: FULL_SCHEMA_INTROSPECTION }),
        buildCoreWorkflowAppOperationsSdl(),
      ]);

    expect(fullSchemaResponse.body.errors).toBeUndefined();

    const scopedSchema: string = scopedBody.data.applicationCoreGraphqlSchema;
    const fullSchemaTypeNames: string[] = [
      ...fullSchemaResponse.body.data.__schema.types.map(
        (type: { name: string }) => type.name,
      ),
      ...collectTypeNames(coreWorkflowOperationsSdl),
    ];

    const scopedTypeNames = collectTypeNames(scopedSchema);

    expect(scopedTypeNames.length).toBeGreaterThan(0);
    expect(
      scopedTypeNames.filter(
        (typeName) => !fullSchemaTypeNames.includes(typeName),
      ),
    ).toEqual([]);
  }, 60000);

  it('is reachable with an API key', async () => {
    const body = await getStandardApplicationSchema(API_KEY_ACCESS_TOKEN);

    expect(body.errors).toBeUndefined();
    expect(body.data.applicationCoreGraphqlSchema).toContain('type Person');
  });

  it('fails for an unknown application', async () => {
    const response = await makeMetadataAPIRequest({
      query: APPLICATION_CORE_GRAPHQL_SCHEMA,
      variables: {
        applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000000',
      },
    });

    expect(response.body.errors).toBeDefined();
  });
});
