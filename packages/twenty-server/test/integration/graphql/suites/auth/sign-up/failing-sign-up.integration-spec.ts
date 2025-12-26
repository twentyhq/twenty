import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';

describe('Successful User Sign Up (integration)', () => {
  it('should fail to sign up with invalid email', async () => {
    const { errors } = await signUp({
      input: {
        email: 'invalid-email',
        password: 'Test123!@#',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail to sign up with duplicate email', async () => {
    const testEmail = `test-duplicate@example.com`;

    const { data: firstSignUp } = await signUp({
      input: {
        email: testEmail,
        password: 'Test123!@#',
      },
      expectToFail: false,
    });

    expect(
      firstSignUp.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
    ).toBeDefined();

    const { errors } = await signUp({
      input: {
        email: testEmail,
        password: 'AnotherPassword123!',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail to sign up with weak password', async () => {
    const { errors } = await signUp({
      input: {
        email: `test-123@example.com`,
        password: '123',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
