import { buildThreadMembersSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-members-section.util';

const FELIX = {
  workspaceMemberId: '11111111-1111-4111-8111-111111111111',
  name: 'Félix',
  isCurrentSender: true,
};
const ETIENNE = {
  workspaceMemberId: '22222222-2222-4222-8222-222222222222',
  name: 'Etienne Jouan',
  isCurrentSender: false,
};

describe('buildThreadMembersSection', () => {
  it('names every member with the reference to mention them', () => {
    const section = buildThreadMembersSection({
      members: [FELIX, ETIENNE],
      totalCount: 2,
      canMentionMembers: true,
      canListMembers: true,
    });

    expect(section).toContain(
      '2 workspace members are in this conversation, 2 listed below.',
    );
    expect(section).toContain(
      `"name":"Etienne Jouan","workspaceMemberId":"${ETIENNE.workspaceMemberId}","reference":"[[record:workspaceMember:${ETIENNE.workspaceMemberId}:Etienne Jouan]]","isCurrentSender":false`,
    );
    expect(section).toContain('To mention someone');
    expect(section).not.toContain('list_thread_members');
  });

  it('points to the listing tool for the members left out', () => {
    const section = buildThreadMembersSection({
      members: [FELIX, ETIENNE],
      totalCount: 27,
      canMentionMembers: true,
      canListMembers: true,
    });

    expect(section).toContain(
      '25 more are not listed: call `list_thread_members` to page through all members.',
    );
  });

  it('only names members where mentions and listing are not offered', () => {
    const section = buildThreadMembersSection({
      members: [FELIX, ETIENNE],
      totalCount: 3,
      canMentionMembers: false,
      canListMembers: false,
    });

    expect(section).toContain('1 more are not listed.');
    expect(section).not.toContain('[[record:');
    expect(section).not.toContain('To mention someone');
    expect(section).not.toContain('list_thread_members');
  });

  it('keeps a name with brackets or line breaks from breaking its reference', () => {
    const section = buildThreadMembersSection({
      members: [{ ...ETIENNE, name: 'Etienne ]] [[x\nJouan' }],
      totalCount: 2,
      canMentionMembers: true,
      canListMembers: true,
    });

    expect(section).toContain(
      `[[record:workspaceMember:${ETIENNE.workspaceMemberId}:Etienne x Jouan]]`,
    );
  });
});
