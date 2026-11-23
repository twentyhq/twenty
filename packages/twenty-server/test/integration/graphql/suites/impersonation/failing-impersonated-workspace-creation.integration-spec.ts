import { randomUUID } from 'crypto';

import { generatePlaygroundToken } from 'test/integration/graphql/suites/user-session/utils/generate-playground-token.util';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { checkWorkspaceSubdomainAvailabilityQueryFactory } from 'test/integration/graphql/utils/check-workspace-subdomain-availability-query-factory.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { impersonate } from 'test/integration/graphql/utils/impersonate.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const expectImpersonationDenied = (errors: BaseGraphQLError[]) => {
  expect(errors).toHaveLength(1);
  expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  expect(errors[0].extensions.userFriendlyMessage).toBe(
    'You do not have permission to perform this action.',
  );
};

const countWorkspaces = () =>
  getCoreRepository<WorkspaceEntity>(WorkspaceEntity).count();

const countUserSessions = () =>
  getCoreRepository<UserSessionEntity>(UserSessionEntity).count();

const getImpersonationAccessToken = async ({
  userId,
  workspaceId,
}: {
  userId: string;
  workspaceId: string;
}): Promise<string> => {
  const { data: impersonateData } = await impersonate({
    userId,
    workspaceId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    expectToFail: false,
  });

  const { data: tokensData } = await getAuthTokensFromLoginToken({
    loginToken: impersonateData.impersonate.loginToken.token,
    origin: impersonateData.impersonate.workspace.workspaceUrls.subdomainUrl,
    expectToFail: false,
  });

  return tokensData.getAuthTokensFromLoginToken.tokens
    .accessOrWorkspaceAgnosticToken.token;
};

describe('Impersonation - workspace creation denial (integration)', () => {
  describe.each([
    {
      level: 'workspace',
      userId: USER_DATA_SEED_IDS.SCOTT,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    },
    {
      level: 'server',
      userId: USER_DATA_SEED_IDS.TIM,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    },
  ])('$level-level impersonation', ({ userId, workspaceId }) => {
    let impersonationAccessToken: string;

    beforeAll(async () => {
      impersonationAccessToken = await getImpersonationAccessToken({
        userId,
        workspaceId,
      });
    });

    it('should refuse to create a workspace as the impersonated user', async () => {
      const workspaceCountBefore = await countWorkspaces();

      const { errors } = await signUpInNewWorkspace({
        accessToken: impersonationAccessToken,
        expectToFail: true,
      });

      expectImpersonationDenied(errors);
      expect(await countWorkspaces()).toBe(workspaceCountBefore);
    });

    it('should refuse to check a subdomain for a new workspace', async () => {
      const response = await makeMetadataApiRequest(
        checkWorkspaceSubdomainAvailabilityQueryFactory({
          subdomain: 'impersonated-workspace',
        }),
        impersonationAccessToken,
      );

      expectImpersonationDenied(response.body.errors);
    });
  });

  it('should refuse to create a workspace with a playground token', async () => {
    const { data: playgroundData } = await generatePlaygroundToken({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const workspaceCountBefore = await countWorkspaces();

    const { errors } = await signUpInNewWorkspace({
      accessToken: playgroundData.generatePlaygroundToken.token,
      expectToFail: true,
    });

    expectImpersonationDenied(errors);
    expect(await countWorkspaces()).toBe(workspaceCountBefore);
  });

  it('should refuse to exchange an impersonation login token that names no impersonator', async () => {
    const userSessionCountBefore = await countUserSessions();

    const loginToken = forgeLegacyHs256Token<LoginTokenJwtPayload>(
      {
        type: JwtTokenTypeEnum.LOGIN,
        sub: 'scott.forstall@apple.dev',
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        authProvider: AuthProviderEnum.Impersonation,
        jti: randomUUID(),
      },
      SEED_APPLE_WORKSPACE_ID,
    );

    const { data, errors } = await getAuthTokensFromLoginToken({
      loginToken,
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(errors[0].message).toBe(
      'Impersonation login token does not name an impersonator',
    );
    expect(data?.getAuthTokensFromLoginToken).toBeFalsy();
    expect(await countUserSessions()).toBe(userSessionCountBefore);
  });
});
