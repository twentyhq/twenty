import { signUp } from 'test/integration/graphql/utils/sign-up.util';

describe('Successful workspace activation flow (integration)', () => {
  let createdUserToken: string;
  afterEach(async () => {});

  it('should create a workspace in pending status via signUpOnNewWorkspace', async () => {
    const { data } = await signUp({
      input: {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });


  });
});
