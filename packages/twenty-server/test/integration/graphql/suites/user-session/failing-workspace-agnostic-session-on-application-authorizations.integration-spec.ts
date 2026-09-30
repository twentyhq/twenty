import { currentUserApplicationAuthorizations } from 'test/integration/graphql/suites/user-session/utils/current-user-application-authorizations.util';
import { revokeApplicationAuthorization } from 'test/integration/graphql/suites/user-session/utils/revoke-application-authorization.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

describe('Application authorizations with a workspace-agnostic session should fail', () => {
  let workspaceAgnosticToken: string;

  beforeAll(async () => {
    const { data } = await signUp({
      input: {
        email: `application-authorizations-agnostic-${Date.now()}@example.com`,
        password: 'Applecar2025!',
      },
      expectToFail: false,
    });

    workspaceAgnosticToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;
  });

  afterAll(async () => {
    if (!isDefined(workspaceAgnosticToken)) {
      return;
    }

    await deleteUser({
      accessToken: workspaceAgnosticToken,
      expectToFail: false,
    });
  });

  it('should refuse to list the application authorizations', async () => {
    const { errors } = await currentUserApplicationAuthorizations({
      token: workspaceAgnosticToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse to revoke an application authorization', async () => {
    const { errors } = await revokeApplicationAuthorization({
      input: { applicationAuthorizationId: uuidv4() },
      token: workspaceAgnosticToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
