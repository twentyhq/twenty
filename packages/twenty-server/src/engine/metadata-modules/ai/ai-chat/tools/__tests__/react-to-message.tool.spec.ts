import { createReactToMessageTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/react-to-message.tool';

describe('createReactToMessageTool', () => {
  it("reacts to the member's latest message", async () => {
    const reactToLatestMemberMessage = jest.fn().mockResolvedValue([]);
    const tool = createReactToMessageTool({ reactToLatestMemberMessage });

    await expect(tool.execute({ emoji: '👍' })).resolves.toEqual({
      success: true,
      message: 'Reacted with 👍',
    });
    expect(reactToLatestMemberMessage).toHaveBeenCalledTimes(1);
    expect(reactToLatestMemberMessage).toHaveBeenCalledWith('👍');
  });

  it('reports a refused reaction to the model instead of failing the turn', async () => {
    const reactToLatestMemberMessage = jest
      .fn()
      .mockRejectedValue(new Error('A reaction must contain an emoji'));
    const tool = createReactToMessageTool({ reactToLatestMemberMessage });

    await expect(tool.execute({ emoji: 'ok' })).resolves.toEqual({
      success: false,
      message: 'Failed to react with ok',
      error: 'A reaction must contain an emoji',
    });
    expect(reactToLatestMemberMessage).toHaveBeenCalledTimes(1);
    expect(reactToLatestMemberMessage).toHaveBeenCalledWith('ok');
  });
});
