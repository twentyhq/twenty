import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const APPLICATION_TOKEN_TYPE_NAME = 'ApplicationTokenPair';

// These two fields are the exceptions the invariant allows: both mint under
// the caller's own session, so the token carries the intersection of that
// user's permissions and the application's role. Anything else reaching an
// application token would be a caller asking the API for an application's
// credentials.
//
// This walks the GraphQL type graph, so it covers the GraphQL surface only.
// The OAuth token endpoint is REST and answers with raw JSON, so it is out of
// reach here; what guards it is the client secret, and the permissions on
// rotating one.
const METADATA_FIELDS_RETURNING_AN_APPLICATION_TOKEN = [
  'FrontComponent.applicationTokenPair',
  'Mutation.renewApplicationToken',
];

const TYPE_REACHABILITY_INTROSPECTION = gql`
  query ApplicationTokenReachability {
    __schema {
      types {
        name
        fields(includeDeprecated: true) {
          name
          type {
            ...TypeRef
          }
        }
      }
    }
  }

  fragment TypeRef on __Type {
    name
    ofType {
      name
      ofType {
        name
        ofType {
          name
        }
      }
    }
  }
`;

type IntrospectedTypeRef = {
  name: string | null;
  ofType?: IntrospectedTypeRef;
};

type IntrospectedType = {
  name: string;
  fields: { name: string; type: IntrospectedTypeRef }[] | null;
};

const unwrapTypeName = (type: IntrospectedTypeRef): string | null =>
  type.name ?? (type.ofType ? unwrapTypeName(type.ofType) : null);

const findFieldsReturningAnApplicationToken = (types: IntrospectedType[]) =>
  types
    .flatMap(
      (type) =>
        type.fields
          ?.filter(
            (field) =>
              unwrapTypeName(field.type) === APPLICATION_TOKEN_TYPE_NAME,
          )
          .map((field) => `${type.name}.${field.name}`) ?? [],
    )
    .sort();

describe('No GraphQL operation returns an application token', () => {
  it('returns an application token from the session-bound metadata fields only', async () => {
    const response = await makeMetadataAPIRequest({
      query: TYPE_REACHABILITY_INTROSPECTION,
    });

    expect(response.body.errors).toBeUndefined();

    expect(
      findFieldsReturningAnApplicationToken(response.body.data.__schema.types),
    ).toEqual(METADATA_FIELDS_RETURNING_AN_APPLICATION_TOKEN);
  });

  it('never returns an application token from the core schema', async () => {
    const response = await makeGraphqlAPIRequest({
      query: TYPE_REACHABILITY_INTROSPECTION,
    });

    expect(response.body.errors).toBeUndefined();

    expect(
      findFieldsReturningAnApplicationToken(response.body.data.__schema.types),
    ).toEqual([]);
  });

  it.each([
    ['an admin session', undefined],
    ['an API key', API_KEY_ACCESS_TOKEN],
  ])(
    'rejects generateApplicationToken called with %s',
    async (_callerName, token) => {
      const response = await makeMetadataAPIRequest(
        {
          query: gql`
            mutation GenerateApplicationToken($applicationId: UUID!) {
              generateApplicationToken(applicationId: $applicationId) {
                applicationAccessToken {
                  token
                }
              }
            }
          `,
          variables: {
            applicationId: '00000000-0000-0000-0000-000000000000',
          },
        },
        token,
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    },
  );
});
