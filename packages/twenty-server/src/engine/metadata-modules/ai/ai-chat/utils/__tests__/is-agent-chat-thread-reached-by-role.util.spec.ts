import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { isAgentChatThreadReachedByRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-thread-reached-by-role.util';

const ROLE_ID = 'role-id';

const ROLE = { id: ROLE_ID, canAccessAllAgentChatChannels: false };

const THREAD_OUTSIDE_CHANNELS = { channelId: null };

const buildRoleGrant = (accessLevel: RecordShareAccessLevel) => ({
  principalType: RecordSharePrincipalType.ROLE,
  principalId: ROLE_ID,
  accessLevel,
});

describe('isAgentChatThreadReachedByRole', () => {
  it.each([RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL])(
    'is reached by a role granted %s',
    (accessLevel) => {
      expect(
        isAgentChatThreadReachedByRole({
          role: ROLE,
          thread: THREAD_OUTSIDE_CHANNELS,
          threadShares: [buildRoleGrant(accessLevel)],
        }),
      ).toBe(true);
    },
  );

  it('is not reached by a role that can only read the chat', () => {
    expect(
      isAgentChatThreadReachedByRole({
        role: ROLE,
        thread: THREAD_OUTSIDE_CHANNELS,
        threadShares: [buildRoleGrant(RecordShareAccessLevel.READ)],
      }),
    ).toBe(false);
  });

  it('is not reached through a grant to another role or to a member with the same id', () => {
    expect(
      isAgentChatThreadReachedByRole({
        role: ROLE,
        thread: THREAD_OUTSIDE_CHANNELS,
        threadShares: [
          {
            principalType: RecordSharePrincipalType.ROLE,
            principalId: 'other-role-id',
            accessLevel: RecordShareAccessLevel.FULL,
          },
          {
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: ROLE_ID,
            accessLevel: RecordShareAccessLevel.FULL,
          },
        ],
      }),
    ).toBe(false);
  });

  it('is reached on a channel chat by a role that reaches every channel', () => {
    expect(
      isAgentChatThreadReachedByRole({
        role: { ...ROLE, canAccessAllAgentChatChannels: true },
        thread: { channelId: 'channel-id' },
        threadShares: [],
      }),
    ).toBe(true);
  });

  it('is not reached outside channels by a role that reaches every channel', () => {
    expect(
      isAgentChatThreadReachedByRole({
        role: { ...ROLE, canAccessAllAgentChatChannels: true },
        thread: THREAD_OUTSIDE_CHANNELS,
        threadShares: [],
      }),
    ).toBe(false);
  });
});
