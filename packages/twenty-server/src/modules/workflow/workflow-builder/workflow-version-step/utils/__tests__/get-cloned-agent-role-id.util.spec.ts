import { getClonedAgentRoleId } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/get-cloned-agent-role-id.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application';

describe('getClonedAgentRoleId', () => {
  it('keeps a role owned by another application, which the clone cannot edit', () => {
    expect(
      getClonedAgentRoleId({
        sourceRole: { id: 'app-role', applicationId: 'installed-application' },
        clonedAgentApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('app-role');
  });

  it('drops a role the clone could edit, so the two agents never share permissions', () => {
    expect(
      getClonedAgentRoleId({
        sourceRole: {
          id: 'agent-only-role',
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        },
        clonedAgentApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBeUndefined();
  });

  it('returns no role when the source agent has none', () => {
    expect(
      getClonedAgentRoleId({
        sourceRole: undefined,
        clonedAgentApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBeUndefined();
  });
});
