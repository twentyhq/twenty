import { buildAgentChatThreadMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-members.util';

const workspaceMemberById = {
  felix: { name: { firstName: 'Félix', lastName: '' }, userEmail: null },
  etienne: {
    name: { firstName: 'Etienne', lastName: 'Jouan' },
    userEmail: 'etienne@example.com',
  },
  ada: { name: { firstName: '', lastName: '' }, userEmail: 'ada@example.com' },
  nameless: { name: { firstName: '', lastName: '' }, userEmail: null },
};

describe('buildAgentChatThreadMembers', () => {
  it('lists the current sender first, then the owner and the participants in join order, once each', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: 'etienne',
          directMessageFirstWorkspaceMemberId: null,
          directMessageSecondWorkspaceMemberId: null,
        },
        participantWorkspaceMemberIds: ['etienne', 'ada', 'felix'],
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

  it('includes both members of a direct message even without participant rows', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: null,
          directMessageFirstWorkspaceMemberId: 'etienne',
          directMessageSecondWorkspaceMemberId: 'felix',
        },
        participantWorkspaceMemberIds: [],
        workspaceMemberById,
        currentWorkspaceMemberId: 'felix',
      }).map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual(['felix', 'etienne']);
  });

  it('leaves out deleted members and members with neither a name nor an email', () => {
    expect(
      buildAgentChatThreadMembers({
        thread: {
          workspaceMemberId: 'etienne',
          directMessageFirstWorkspaceMemberId: null,
          directMessageSecondWorkspaceMemberId: null,
        },
        participantWorkspaceMemberIds: ['deleted', 'nameless'],
        workspaceMemberById,
        currentWorkspaceMemberId: 'etienne',
      }).map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual(['etienne']);
  });
});
