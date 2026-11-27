import { createListThreadMembersTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/list-thread-members.tool';

const members = Array.from({ length: 5 }, (_, index) => ({
  workspaceMemberId: `0000000${index}-0000-4000-8000-000000000000`,
  name: `Member ${index}`,
  isCurrentSender: index === 0,
}));

describe('createListThreadMembersTool', () => {
  it('returns one page of members with their references and whether more remain', async () => {
    const tool = createListThreadMembersTool({
      findMembers: jest.fn().mockResolvedValue(members),
      canMentionMembers: true,
    });

    await expect(tool.execute({ offset: 2, limit: 2 })).resolves.toEqual({
      success: true,
      message: 'Listed 2 of 5 members',
      result: {
        members: [
          {
            name: 'Member 2',
            workspaceMemberId: members[2].workspaceMemberId,
            reference: `[[record:workspaceMember:${members[2].workspaceMemberId}:Member 2]]`,
            isCurrentSender: false,
          },
          {
            name: 'Member 3',
            workspaceMemberId: members[3].workspaceMemberId,
            reference: `[[record:workspaceMember:${members[3].workspaceMemberId}:Member 3]]`,
            isCurrentSender: false,
          },
        ],
        totalCount: 5,
        hasMore: true,
      },
    });
  });

  it('says no more remain on the last page', async () => {
    const tool = createListThreadMembersTool({
      findMembers: jest.fn().mockResolvedValue(members),
      canMentionMembers: false,
    });

    await expect(tool.execute({ offset: 4, limit: 50 })).resolves.toMatchObject(
      {
        success: true,
        result: {
          members: [
            {
              name: 'Member 4',
              workspaceMemberId: members[4].workspaceMemberId,
              isCurrentSender: false,
            },
          ],
          totalCount: 5,
          hasMore: false,
        },
      },
    );
  });

  it('reports a failed lookup to the model instead of failing the turn', async () => {
    const tool = createListThreadMembersTool({
      findMembers: jest.fn().mockRejectedValue(new Error('cache down')),
      canMentionMembers: true,
    });

    await expect(tool.execute({ offset: 0, limit: 50 })).resolves.toEqual({
      success: false,
      message: 'Failed to list the conversation members',
      error: 'cache down',
    });
  });
});
