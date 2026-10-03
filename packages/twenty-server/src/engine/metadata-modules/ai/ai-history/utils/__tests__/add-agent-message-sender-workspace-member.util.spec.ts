import { addAgentMessageSenderWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-history/utils/add-agent-message-sender-workspace-member.util';

const setup = () => {
  const query = jest
    .fn()
    .mockResolvedValue([{ membershipId: 'sender', memberId: 'member' }]);
  const expand = (
    values: Record<string, unknown> | Record<string, unknown>[],
  ) =>
    addAgentMessageSenderWorkspaceMember(
      'agentMessage',
      values,
      '20202020-1111-4111-8111-111111111111',
      { manager: { query } } as never,
    );
  return { query, expand };
};

describe('sender workspace member expansion', () => {
  it('writes members in a batch without changing sender or application IDs', async () => {
    const { query, expand } = setup();
    const messages = [
      { senderUserWorkspaceId: 'sender', senderApplicationId: 'application' },
      { senderUserWorkspaceId: 'sender', isHidden: true },
      { senderUserWorkspaceId: 'removed' },
    ];
    expect(await expand(messages)).toEqual(
      messages.map((message) => ({
        ...message,
        senderWorkspaceMemberId:
          message.senderUserWorkspaceId === 'sender' ? 'member' : null,
      })),
    );
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('membership."workspaceId" = $1'),
      ['20202020-1111-4111-8111-111111111111', ['sender', 'removed']],
    );
  });
  it('does not invent a sender for historical or assistant messages', async () => {
    const { query, expand } = setup();
    expect(await expand({ senderUserWorkspaceId: null })).toEqual({
      senderUserWorkspaceId: null,
    });
    expect(query).not.toHaveBeenCalled();
  });
  it('leaves records other than messages untouched', async () => {
    const query = jest.fn();
    const turn = { senderUserWorkspaceId: 'sender' };
    expect(
      await addAgentMessageSenderWorkspaceMember(
        'agentTurn',
        turn,
        '20202020-1111-4111-8111-111111111111',
        { manager: { query } } as never,
      ),
    ).toBe(turn);
    expect(query).not.toHaveBeenCalled();
  });
});
