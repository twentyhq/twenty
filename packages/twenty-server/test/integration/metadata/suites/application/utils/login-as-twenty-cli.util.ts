import crypto from 'crypto';
import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const CLI_CALLBACK_URL = 'http://127.0.0.1:53682/callback';

// Same browser flow as `twenty remote add`: authorize the CLI client with PKCE
// as the workspace admin, then exchange the code for the CLI access token.
export const loginAsTwentyCli = async (): Promise<string> => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  const discovery = await request(baseUrl)
    .get('/.well-known/oauth-authorization-server')
    .expect(200);

  const clientId: string = discovery.body.cli_client_id;
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const authorizeResponse = await makeMetadataApiRequest({
    query: gql`
      mutation AuthorizeApp(
        $clientId: String!
        $codeChallenge: String
        $redirectUrl: String!
      ) {
        authorizeApp(
          clientId: $clientId
          codeChallenge: $codeChallenge
          redirectUrl: $redirectUrl
        ) {
          redirectUrl
        }
      }
    `,
    variables: { clientId, codeChallenge, redirectUrl: CLI_CALLBACK_URL },
  });

  expect(authorizeResponse.body.errors).toBeUndefined();

  const code = new URL(
    authorizeResponse.body.data.authorizeApp.redirectUrl,
  ).searchParams.get('code');

  const tokenResponse = await request(baseUrl)
    .post('/oauth/token')
    .send({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: CLI_CALLBACK_URL,
      client_id: clientId,
    })
    .expect(200);

  return tokenResponse.body.access_token;
};
