import { buildAgentChatThreadMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-members.util';

const workspaceMemberById = {
  felix: { name: { firstName: 'Félix', lastName: '' }, userEmail: null },
  etienne: {
    name: { firstName: 'Etienne', lastName: 'Jouan' },
    userEmail: null,
  },
  ada: { name: { firstName: '', lastName: '' }, userEmail: 'ada@example.com' },
};

describe('buildAgentChatThreadMembers', () => {
  it('lists the owner then the writers once each, skipping deleted members', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: 'etienne',
          directMessageFirstWorkspaceMemberId: null,
          directMessageSecondWorkspaceMemberId: null,
          writerWorkspaceMemberIds: ['ada', 'deleted', 'etienne', 'felix'],
        },
        workspaceMemberById,
      }),
    ).toEqual([
      { workspaceMemberId: 'etienne', name: 'Etienne Jouan' },
      { workspaceMemberId: 'ada', name: 'ada@example.com' },
      { workspaceMemberId: 'felix', name: 'Félix' },
    ]);
  });

  it('includes both members of a direct message', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: null,
          directMessageFirstWorkspaceMemberId: 'etienne',
          directMessageSecondWorkspaceMemberId: 'felix',
          writerWorkspaceMemberIds: null,
        },
        workspaceMemberById,
      }).map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual(['etienne', 'felix']);
  });
});
