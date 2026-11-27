import { buildThreadMembersSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-members-section.util';

const buildMembers = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    workspaceMemberId: `member-${index}`,
    name: index === 1 ? 'Etienne [Ops]\nJouan' : `Member ${index}`,
    isCurrentSender: index === 0,
  }));

describe('buildThreadMembersSection', () => {
  it('lists each member with a reference that a bracketed name cannot break', () => {
    const section = buildThreadMembersSection(buildMembers(2));

    expect(section).toContain('2 workspace members are in this conversation.');
    expect(section).toContain(
      '"reference":"[[record:workspaceMember:member-1:Etienne Ops Jouan]]"',
    );
    expect(section).not.toContain('list_thread_members');
  });

  it('lists the first 20 and points to the listing tool for the rest', () => {
    const section = buildThreadMembersSection(buildMembers(27));

    expect(section).toContain('"name":"Member 19"');
    expect(section).not.toContain('"name":"Member 20"');
    expect(section).toContain(
      '7 more are not listed: call `list_thread_members`',
    );
  });
});
