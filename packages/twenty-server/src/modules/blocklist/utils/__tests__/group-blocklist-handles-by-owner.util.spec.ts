import { BlocklistScope } from 'twenty-shared/types';

import { groupBlocklistHandlesByOwner } from 'src/modules/blocklist/utils/group-blocklist-handles-by-owner.util';

describe('groupBlocklistHandlesByOwner', () => {
  it('groups member-scoped handles under their workspace member', () => {
    const { workspaceScopedHandles, handlesByWorkspaceMemberId } =
      groupBlocklistHandlesByOwner([
        {
          handle: 'first@twenty.com',
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: 'member-1',
        },
        {
          handle: 'second@twenty.com',
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: 'member-1',
        },
        {
          handle: 'third@twenty.com',
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: 'member-2',
        },
      ]);

    expect(workspaceScopedHandles).toEqual([]);
    expect(handlesByWorkspaceMemberId.get('member-1')).toEqual([
      'first@twenty.com',
      'second@twenty.com',
    ]);
    expect(handlesByWorkspaceMemberId.get('member-2')).toEqual([
      'third@twenty.com',
    ]);
  });

  it('collects workspace-scoped handles separately from member-scoped ones', () => {
    const { workspaceScopedHandles, handlesByWorkspaceMemberId } =
      groupBlocklistHandlesByOwner([
        {
          handle: '@competitor.com',
          scope: BlocklistScope.WORKSPACE,
          workspaceMemberId: null,
        },
        {
          handle: 'private@twenty.com',
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: 'member-1',
        },
      ]);

    expect(workspaceScopedHandles).toEqual(['@competitor.com']);
    expect(handlesByWorkspaceMemberId.get('member-1')).toEqual([
      'private@twenty.com',
    ]);
  });

  it('drops a member-scoped handle whose workspace member was removed instead of applying it workspace-wide', () => {
    const { workspaceScopedHandles, handlesByWorkspaceMemberId } =
      groupBlocklistHandlesByOwner([
        {
          handle: 'orphan@twenty.com',
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: null,
        },
      ]);

    expect(workspaceScopedHandles).toEqual([]);
    expect(handlesByWorkspaceMemberId.size).toBe(0);
  });

  it('drops entries without a handle', () => {
    const { workspaceScopedHandles, handlesByWorkspaceMemberId } =
      groupBlocklistHandlesByOwner([
        {
          handle: null,
          scope: BlocklistScope.WORKSPACE,
          workspaceMemberId: null,
        },
        {
          handle: null,
          scope: BlocklistScope.WORKSPACE_MEMBER,
          workspaceMemberId: 'member-1',
        },
      ]);

    expect(workspaceScopedHandles).toEqual([]);
    expect(handlesByWorkspaceMemberId.size).toBe(0);
  });
});
