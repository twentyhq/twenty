import { v5 } from 'uuid';

import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';

const NAMESPACE = '1e9195f3-c26a-4bfc-961e-dc317b4badbd';

const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const userWorkspaceId = '20202020-9e3b-46d4-a556-88b9ddc2b034';

describe('buildWorkspaceSetupChatThreadId', () => {
  it('should derive the thread id from the workspace and user workspace pair', () => {
    expect(
      buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }),
    ).toBe(v5(`${workspaceId}:${userWorkspaceId}`, NAMESPACE));
  });

  it('should be stable across calls', () => {
    expect(
      buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }),
    ).toBe(buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }));
  });

  it('should give each workspace and user workspace pair its own thread id', () => {
    const otherWorkspaceId = '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0';
    const otherUserWorkspaceId = '20202020-7a6f-4b2e-9c33-2f1e6b7c8d90';

    expect(
      buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }),
    ).not.toBe(
      buildWorkspaceSetupChatThreadId({
        workspaceId: otherWorkspaceId,
        userWorkspaceId,
      }),
    );

    expect(
      buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }),
    ).not.toBe(
      buildWorkspaceSetupChatThreadId({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
      }),
    );
  });
});
