import { writeFile } from 'node:fs/promises';

export const SERVER_URL = process.env.TWENTY_SERVER_URL ?? 'http://localhost:3000';
export const GRAPHQL_URL = `${SERVER_URL}/graphql`;
// Auth mutations are served by the core/metadata schema, not the workspace one.
const METADATA_GRAPHQL_URL = `${SERVER_URL}/metadata`;
const ORIGIN = process.env.TWENTY_FRONT_ORIGIN ?? 'http://localhost:3001';

const rawGraphqlRequest = async ({ query, variables, token, url = GRAPHQL_URL }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (payload.errors?.length > 0) {
    throw new Error(`GraphQL error: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
};

// Same auth flow as the Twenty front: credentials -> login token -> access token.
export const loginAndGetAccessToken = async () => {
  const email = 'tim@apple.dev';
  const password = 'tim@apple.dev';

  const loginTokenData = await rawGraphqlRequest({
    query: `mutation GetLoginToken($email: String!, $password: String!, $origin: String!) {
      getLoginTokenFromCredentials(email: $email, password: $password, origin: $origin) {
        loginToken { token }
      }
    }`,
    variables: { email, password, origin: ORIGIN },
    url: METADATA_GRAPHQL_URL,
  });

  const loginToken = loginTokenData.getLoginTokenFromCredentials.loginToken.token;

  const authTokensData = await rawGraphqlRequest({
    query: `mutation GetAuthTokens($loginToken: String!, $origin: String!) {
      getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
        tokens { accessOrWorkspaceAgnosticToken { token } }
      }
    }`,
    variables: { loginToken, origin: ORIGIN },
    url: METADATA_GRAPHQL_URL,
  });

  return authTokensData.getAuthTokensFromLoginToken.tokens
    .accessOrWorkspaceAgnosticToken.token;
};

export const introspectSchemaSdl = async ({ token }) => {
  const { buildClientSchema, getIntrospectionQuery, printSchema } = await import(
    'graphql'
  );

  const data = await rawGraphqlRequest({
    query: getIntrospectionQuery(),
    token,
  });

  return printSchema(buildClientSchema(data));
};

export const writeJson = async (path, value) => {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
};
