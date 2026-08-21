import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getActingUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-acting-user-from-auth-context.util';

describe('getActingUserFromAuthContext', () => {
  it('should name the person a run acts on behalf of', () => {
    expect(
      getActingUserFromAuthContext({
        type: 'user',
        workspace: { id: 'workspace-1' },
        user: { id: 'user-1' },
        userWorkspaceId: 'user-workspace-1',
      } as WorkspaceAuthContext),
    ).toEqual({
      actingUserId: 'user-1',
      actingUserWorkspaceId: 'user-workspace-1',
    });
  });

  it('should name nobody for a run the application owns', () => {
    expect(
      getActingUserFromAuthContext({
        type: 'application',
        workspace: { id: 'workspace-1' },
        application: { id: 'app-1' },
      } as WorkspaceAuthContext),
    ).toEqual({});
  });
});
