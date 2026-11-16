import { randomUUID } from 'node:crypto';

import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { deleteUserFromWorkspace } from 'test/integration/graphql/suites/user-session/utils/delete-user-from-workspace.util';
import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { forgeLegacyHs256Token } from 'test/integration/graphql/utils/forge-legacy-hs256-token.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInWorkspaceAndGetAccessToken } from 'test/integration/graphql/utils/sign-up-in-workspace-and-get-access-token.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const countSessions = (userId: string) =>
  getCoreRepository<UserSessionEntity>(UserSessionEntity).count({
    where: { userId },
  });

describe('Impersonation - login token without an impersonator (integration)', () => {
  const email = `impersonation-target-${randomUUID()}@example.com`;
  let userId: string;
  let workspaceMemberId: string;

  beforeAll(async () => {
    const accessToken = await signUpInWorkspaceAndGetAccessToken(email);

    const { data } = await currentUser({
      gqlFields: 'id workspaceMember { id }',
      token: accessToken,
      expectToFail: false,
    });

    jestExpectToBeDefined(data.currentUser.workspaceMember?.id);

    userId = data.currentUser.id;
    workspaceMemberId = data.currentUser.workspaceMember.id;
  }, 120000);

  afterAll(async () => {
    await deleteUserFromWorkspace({
      input: { workspaceMemberIdToDelete: workspaceMemberId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  it('refuses the exchange and opens no session', async () => {
    const loginTokenPayload: LoginTokenJwtPayload = {
      type: JwtTokenTypeEnum.LOGIN,
      sub: email,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      authProvider: AuthProviderEnum.Impersonation,
      jti: randomUUID(),
    };

    const sessionsBefore = await countSessions(userId);

    const { data, errors } = await getAuthTokensFromLoginToken({
      loginToken: forgeLegacyHs256Token(
        loginTokenPayload,
        SEED_APPLE_WORKSPACE_ID,
      ),
      origin: buildAppleWorkspaceOrigin(),
      expectToFail: true,
    });

    expect(data?.getAuthTokensFromLoginToken).toBeUndefined();
    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    expect(errors[0].message).toBe(
      'Impersonation login token is missing its impersonator',
    );
    expect(await countSessions(userId)).toBe(sessionsBefore);
  });
});
