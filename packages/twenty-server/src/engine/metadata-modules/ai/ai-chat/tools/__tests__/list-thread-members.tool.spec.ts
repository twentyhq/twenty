import { createListThreadMembersTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/list-thread-members.tool';

describe('createListThreadMembersTool', () => {
  it('returns one page of members with their references', async () => {
    const members = Array.from({ length: 5 }, (_, index) => ({
      workspaceMemberId: `member-${index}`,
      name: `Member ${index}`,
      isCurrentSender: index === 0,
    }));

    await expect(
      createListThreadMembersTool(members).execute({ offset: 3, limit: 50 }),
    ).resolves.toEqual({
      success: true,
      message: 'Listed members 4 to 5 of 5',
      result: {
        members: [3, 4].map((index) => ({
          workspaceMemberId: `member-${index}`,
          name: `Member ${index}`,
          isCurrentSender: false,
          reference: `[[record:workspaceMember:member-${index}:Member ${index}]]`,
        })),
        totalCount: 5,
      },
    });
  });
});
