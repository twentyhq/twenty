import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { signUpOnNewWorkspace } from 'test/integration/graphql/utils/sign-up-on-new-workspace.util';

// TODO implement strong coverage on all exceptions
describe.skip('Failing workspace creation flow (integration)', () => {
  it('should fail to activate workspace without displayName', async () => {
    const { data: signUpData } = await signUpOnNewWorkspace({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { errors } = await activateWorkspace({
      accessToken: signUpData.signUpInNewWorkspace.loginToken.token,
      displayName: '',
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail to activate already active workspace', async () => {
    const { errors } = await activateWorkspace({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      displayName: 'Test Workspace 2',
      expectToFail: true,
    });

    console.log(errors);
    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
