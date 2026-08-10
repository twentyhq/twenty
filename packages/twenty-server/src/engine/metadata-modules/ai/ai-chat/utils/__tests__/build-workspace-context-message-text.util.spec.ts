import { buildWorkspaceContextMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-context-message-text.util';

describe('buildWorkspaceContextMessageText', () => {
  it('should describe the workspace and the admin email', () => {
    const result = buildWorkspaceContextMessageText({
      workspaceDisplayName: 'Acme',
      workspaceSubdomain: 'acme',
      userEmail: 'admin@acme.com',
    });

    expect(result).toBe(
      'This workspace is named "Acme" (subdomain: acme). The admin setting it up signed up with admin@acme.com.',
    );
  });

  it('should state that the workspace has no name yet instead of inventing one', () => {
    const result = buildWorkspaceContextMessageText({
      workspaceDisplayName: null,
      workspaceSubdomain: 'acme',
      userEmail: 'admin@acme.com',
    });

    expect(result).toBe(
      'This workspace is not named yet (subdomain: acme). The admin setting it up signed up with admin@acme.com.',
    );
  });
});
