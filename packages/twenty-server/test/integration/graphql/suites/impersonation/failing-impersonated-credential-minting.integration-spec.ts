import { authorizeApp } from 'test/integration/graphql/suites/user-session/utils/authorize-app.util';
import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { assignRoleToApiKey } from 'test/integration/graphql/utils/assign-role-to-api-key.util';
import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';

const expectAuthPrincipalRefused = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors[0].message).toBe(AUTH_PRINCIPAL_REFUSED_MESSAGE);
};

const impersonationLevelTestCases = [
  { level: 'workspace', workspaceId: SEED_APPLE_WORKSPACE_ID },
  { level: 'server', workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID },
];

describe('Impersonation - credential minting denial (integration)', () => {
  describe.each(impersonationLevelTestCases)(
    'from a $level-level impersonated session',
    ({ workspaceId }) => {
      let impersonationAccessToken: string;

      beforeAll(async () => {
        const { data: impersonateData } = await impersonate({
          userId: USER_DATA_SEED_IDS.TIM,
          workspaceId,
          accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          expectToFail: false,
        });

        const { data: tokensData } = await getAuthTokensFromLoginToken({
          loginToken: impersonateData.impersonate.loginToken.token,
          origin:
            impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
          expectToFail: false,
        });

        impersonationAccessToken =
          tokensData.getAuthTokensFromLoginToken.tokens
            .accessOrWorkspaceAgnosticToken.token;
      });

      it('should refuse to mint a playground token', async () => {
        const { errors } = await generatePlaygroundToken({
          token: impersonationAccessToken,
          expectToFail: true,
        });

        expectAuthPrincipalRefused(errors);
      });

      it('should refuse to mint an API key token', async () => {
        const response = await generateApiKeyToken({
          apiKeyId: API_KEY_DATA_SEED_IDS.ID_1,
          accessToken: impersonationAccessToken,
        });

        expectAuthPrincipalRefused(response.body.errors);
      });

      it('should refuse to create an API key', async () => {
        const response = await createApiKey({
          name: 'Impersonated key',
          expiresAt: '2099-01-01T00:00:00.000Z',
          roleId: uuidv4(),
          accessToken: impersonationAccessToken,
        });

        expectAuthPrincipalRefused(response.body.errors);
      });

      it('should refuse to create an API key through REST', async () => {
        const response = await makeRestApiRequest({
          method: 'post',
          path: '/apiKeys',
          bearer: impersonationAccessToken,
          body: {
            name: 'Impersonated key',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        });

        expect(response.status).toBe(403);
        expect(response.body.messages).toStrictEqual([
          AUTH_PRINCIPAL_REFUSED_MESSAGE,
        ]);
      });

      it('should refuse to assign a role to an API key', async () => {
        const response = await assignRoleToApiKey({
          apiKeyId: API_KEY_DATA_SEED_IDS.ID_1,
          roleId: uuidv4(),
          accessToken: impersonationAccessToken,
        });

        expectAuthPrincipalRefused(response.body.errors);
      });

      it('should refuse to consent to an OAuth client', async () => {
        const { errors } = await authorizeApp({
          input: {
            clientId: uuidv4(),
            redirectUrl: 'https://app.twenty.test/callback',
            codeChallenge: 'a'.repeat(43),
          },
          token: impersonationAccessToken,
          expectToFail: true,
        });

        expectAuthPrincipalRefused(errors);
      });
    },
  );

  it('should refuse to start an impersonation from a playground token', async () => {
    const { data } = await generatePlaygroundToken({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { errors } = await impersonate({
      userId: USER_DATA_SEED_IDS.SCOTT,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      accessToken: data.generatePlaygroundToken.token,
      expectToFail: true,
    });

    expectAuthPrincipalRefused(errors);
  });
});
