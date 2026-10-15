import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';

describe('isDenyingRoleIdsBySource', () => {
  it('denies when no source restricts', () => {
    expect(isDenyingRoleIdsBySource({})).toBe(true);
    expect(isDenyingRoleIdsBySource({ applicationRoleId: undefined })).toBe(
      true,
    );
  });

  it('denies when an actor takes part without a role', () => {
    expect(
      isDenyingRoleIdsBySource({
        userWorkspaceRoleId: 'member-role-id',
        agentRoleId: null,
      }),
    ).toBe(true);
  });

  it('allows when every actor that takes part has a role', () => {
    expect(
      isDenyingRoleIdsBySource({
        userWorkspaceRoleId: 'member-role-id',
        applicationRoleId: 'application-role-id',
      }),
    ).toBe(false);
  });
});
