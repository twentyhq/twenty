import { BlocklistScope } from 'twenty-shared/types';

import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';
import { groupBlocklistEntriesForUniqueness } from 'src/modules/blocklist/utils/group-blocklist-entries-for-uniqueness.util';

const context: BlocklistMutationContext = {
  workspaceId: 'workspace-id',
  workspaceMemberId: 'caller-member-id',
  userWorkspaceId: 'user-workspace-id',
};

type ExistingRecord = Pick<
  BlocklistWorkspaceEntity,
  'handle' | 'scope' | 'workspaceMemberId'
>;

const existingRecord = (
  overrides: Partial<ExistingRecord>,
): ExistingRecord => ({
  handle: null,
  scope: BlocklistScope.WORKSPACE_MEMBER,
  workspaceMemberId: 'caller-member-id',
  ...overrides,
});

describe('groupBlocklistEntriesForUniqueness', () => {
  it('groups new member-scoped handles under the caller', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [
        { item: { handle: 'a@acme.com' }, existingRecord: null },
        { item: { handle: 'b@acme.com' }, existingRecord: null },
      ],
      context,
    });

    expect(groups).toEqual([
      {
        scope: BlocklistScope.WORKSPACE_MEMBER,
        workspaceMemberId: 'caller-member-id',
        handles: ['a@acme.com', 'b@acme.com'],
        retainedHandles: [],
      },
    ]);
  });

  it('keeps workspace-scoped handles in their own group', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [
        {
          item: { handle: '@spam.com', scope: BlocklistScope.WORKSPACE },
          existingRecord: null,
        },
        { item: { handle: 'mine@acme.com' }, existingRecord: null },
      ],
      context,
    });

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.scope)).toEqual([
      BlocklistScope.WORKSPACE,
      BlocklistScope.WORKSPACE_MEMBER,
    ]);
  });

  it('skips entries whose handle is unchanged', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [
        {
          item: { handle: 'same@acme.com' },
          existingRecord: existingRecord({ handle: 'same@acme.com' }),
        },
      ],
      context,
    });

    expect(groups).toEqual([]);
  });

  it('records the previous handle as retained when a handle is replaced', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [
        {
          item: { handle: 'new@acme.com' },
          existingRecord: existingRecord({ handle: 'old@acme.com' }),
        },
      ],
      context,
    });

    expect(groups[0].handles).toEqual(['new@acme.com']);
    expect(groups[0].retainedHandles).toEqual(['old@acme.com']);
  });

  it('groups an existing record under its own owner, not the caller', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [
        {
          item: { handle: 'new@acme.com' },
          existingRecord: existingRecord({
            handle: 'old@acme.com',
            workspaceMemberId: 'other-member-id',
          }),
        },
      ],
      context,
    });

    expect(groups[0].workspaceMemberId).toBe('other-member-id');
  });

  it('ignores entries without a handle', () => {
    const groups = groupBlocklistEntriesForUniqueness({
      entries: [{ item: {}, existingRecord: null }],
      context,
    });

    expect(groups).toEqual([]);
  });
});
