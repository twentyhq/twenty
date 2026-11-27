import { isAgentChatChannelOpenToRoles } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-roles.util';

const ROLE_ID = '20202020-0000-4000-8000-000000000001';

describe('isAgentChatChannelOpenToRoles', () => {
  it.each([
    {
      title: 'a member without a role',
      roleIds: [ROLE_ID],
      roles: [],
      expected: false,
    },
    {
      title: 'a role with access to all channels',
      roleIds: [],
      roles: [{ id: ROLE_ID, canAccessAllAgentChatChannels: true }],
      expected: true,
    },
    {
      title: 'a role the channel lists',
      roleIds: [ROLE_ID],
      roles: [{ id: ROLE_ID, canAccessAllAgentChatChannels: false }],
      expected: true,
    },
    {
      title: 'a role the channel does not list',
      roleIds: [],
      roles: [{ id: ROLE_ID, canAccessAllAgentChatChannels: false }],
      expected: false,
    },
  ])('returns $expected for $title', ({ roleIds, roles, expected }) => {
    expect(isAgentChatChannelOpenToRoles({ channel: { roleIds }, roles })).toBe(
      expected,
    );
  });
});
