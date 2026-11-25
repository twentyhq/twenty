import { normalizeAgentChatDirectMessagePairOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/normalize-agent-chat-direct-message-pair-or-throw.util';

describe('normalizeAgentChatDirectMessagePairOrThrow', () => {
  const firstWorkspaceMemberId = '72c084c8-382a-4f5e-bda6-dac4a988f792';
  const secondWorkspaceMemberId = 'b3108f32-2084-4b2d-8ab3-31ecc82a1d3a';

  it('normalizes reversed members and UUID casing to the same pair', () => {
    const pair = normalizeAgentChatDirectMessagePairOrThrow({
      firstWorkspaceMemberId,
      secondWorkspaceMemberId,
    });

    expect(pair).toEqual({
      directMessageFirstWorkspaceMemberId: firstWorkspaceMemberId,
      directMessageSecondWorkspaceMemberId: secondWorkspaceMemberId,
    });
    expect(
      normalizeAgentChatDirectMessagePairOrThrow({
        firstWorkspaceMemberId: secondWorkspaceMemberId.toUpperCase(),
        secondWorkspaceMemberId: firstWorkspaceMemberId.toUpperCase(),
      }),
    ).toEqual(pair);
  });

  it('rejects the same member with different UUID casing', () => {
    expect(() =>
      normalizeAgentChatDirectMessagePairOrThrow({
        firstWorkspaceMemberId,
        secondWorkspaceMemberId: firstWorkspaceMemberId.toUpperCase(),
      }),
    ).toThrow('Direct messages require two different workspace members');
  });

  it.each([
    { firstWorkspaceMemberId: 'invalid', secondWorkspaceMemberId },
    { firstWorkspaceMemberId, secondWorkspaceMemberId: 'invalid' },
  ])('rejects invalid member identifiers: %j', (members) => {
    expect(() => normalizeAgentChatDirectMessagePairOrThrow(members)).toThrow(
      'Direct messages require two valid workspace member IDs',
    );
  });
});
