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
  it('lists the current sender first, then the owner and writers once each, skipping deleted members', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: 'etienne',
          directMessageFirstWorkspaceMemberId: null,
          directMessageSecondWorkspaceMemberId: null,
          writerWorkspaceMemberIds: ['ada', 'deleted', 'felix'],
        },
        workspaceMemberById,
        currentWorkspaceMemberId: 'felix',
      }),
    ).toEqual([
      { workspaceMemberId: 'felix', name: 'Félix', isCurrentSender: true },
      {
        workspaceMemberId: 'etienne',
        name: 'Etienne Jouan',
        isCurrentSender: false,
      },
      {
        workspaceMemberId: 'ada',
        name: 'ada@example.com',
        isCurrentSender: false,
      },
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
        currentWorkspaceMemberId: 'felix',
      }).map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual(['felix', 'etienne']);
  });
});
