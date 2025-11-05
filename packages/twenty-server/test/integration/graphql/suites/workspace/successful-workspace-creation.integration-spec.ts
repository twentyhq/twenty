import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { signUpOnNewWorkspace } from 'test/integration/graphql/utils/sign-up-on-new-workspace.util';

describe('Successful workspace creation flow (integration)', () => {
  let createdUserToken: string;
  afterEach(async () => {});

  it('should create a workspace in pending status via signUpOnNewWorkspace', async () => {
    const { data } = await signUpOnNewWorkspace({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.signUpInNewWorkspace.loginToken.token).toBeDefined();
    expect(data.signUpInNewWorkspace.loginToken.expiresAt).toBeDefined();
    expect(data.signUpInNewWorkspace.workspace.id).toBeDefined();
    expect(
      data.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl,
    ).toBeDefined();
  });

  it('should create and activate a workspace successfully', async () => {
    // Step 1: Sign up on a new workspace (creates PENDING_CREATION workspace)
    const { data: signUpData } = await signUpOnNewWorkspace({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(signUpData.signUpInNewWorkspace.loginToken.token).toBeDefined();
    expect(signUpData.signUpInNewWorkspace.workspace.id).toBeDefined();

    // Step 2: Use the login token to activate the workspace
    const { data: activationData } = await activateWorkspace({
      accessToken: signUpData.signUpInNewWorkspace.loginToken.token,
      displayName: 'Test Workspace',
      expectToFail: false,
    });

    expect(activationData.activateWorkspace.id).toBe(
      signUpData.signUpInNewWorkspace.workspace.id,
    );
    expect(activationData.activateWorkspace.displayName).toBe('Test Workspace');
    expect(activationData.activateWorkspace.activationStatus).toBe('ACTIVE');
    expect(activationData.activateWorkspace.subdomain).toBeDefined();
    expect(activationData.activateWorkspace.inviteHash).toBeDefined();
  });
});
