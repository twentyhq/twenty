import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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
    // The application SDL appends the core workflow operations, which live on
    // the metadata schema, so the reference set is both schemas together.
    const [scopedBody, fullSchemaResponse, metadataSchemaResponse] =
      await Promise.all([
        getStandardApplicationSchema(),
        makeGraphqlAPIRequest({ query: FULL_SCHEMA_INTROSPECTION }),
        makeMetadataAPIRequest({ query: FULL_SCHEMA_INTROSPECTION }),
      ]);

    expect(fullSchemaResponse.body.errors).toBeUndefined();
    expect(metadataSchemaResponse.body.errors).toBeUndefined();

    const scopedSchema: string = scopedBody.data.applicationCoreGraphqlSchema;
    const fullSchemaTypeNames: string[] = [
      ...fullSchemaResponse.body.data.__schema.types,
      ...metadataSchemaResponse.body.data.__schema.types,
    ].map((type: { name: string }) => type.name);

    const scopedTypeNames = Array.from(
      scopedSchema.matchAll(/^type (\w+)/gm),
    ).map(([, typeName]) => typeName);

    expect(scopedTypeNames.length).toBeGreaterThan(0);
    expect(
      scopedTypeNames.filter(
        (typeName) => !fullSchemaTypeNames.includes(typeName),
      ),
    ).toEqual([]);
  });

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
