import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';

describe('getUserFromAuthContext', () => {
  it('should name the person a run acts on behalf of', () => {
    expect(
      getUserFromAuthContext({
        type: 'user',
        workspace: { id: 'workspace-1' },
        user: { id: 'user-1' },
        userWorkspaceId: 'user-workspace-1',
      } as WorkspaceAuthContext),
    ).toEqual({
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
    });
  });

  it('should name nobody for a run the application owns', () => {
    expect(
      getUserFromAuthContext({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: { id: 'app-1' },
      } as WorkspaceAuthContext),
    ).toEqual({});
  });
});
