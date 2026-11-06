import { isAgentChatDirectMessageAddressedWithinPair } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-direct-message-addressed-within-pair.util';

describe('isAgentChatDirectMessageAddressedWithinPair', () => {
  const firstWorkspaceMemberId = '72c084c8-382a-4f5e-bda6-dac4a988f792';
  const secondWorkspaceMemberId = 'b3108f32-2084-4b2d-8ab3-31ecc82a1d3a';
  const outsideWorkspaceMemberId = 'c4219043-3195-4c3e-9bc5-42fdd93b2e4b';
  const thread = {
    directMessageFirstWorkspaceMemberId: firstWorkspaceMemberId,
    directMessageSecondWorkspaceMemberId: secondWorkspaceMemberId,
  };

  it('accepts a pair member addressing the other member in any UUID casing', () => {
    expect(
      isAgentChatDirectMessageAddressedWithinPair({
        thread,
        senderWorkspaceMemberId: firstWorkspaceMemberId,
        addressedWorkspaceMemberIds: [secondWorkspaceMemberId.toUpperCase()],
      }),
    ).toBe(true);
  });

  it.each([
    {
      senderWorkspaceMemberId: outsideWorkspaceMemberId,
      addressedWorkspaceMemberIds: [secondWorkspaceMemberId],
    },
    {
      senderWorkspaceMemberId: firstWorkspaceMemberId,
      addressedWorkspaceMemberIds: [outsideWorkspaceMemberId],
    },
  ])('rejects a sender or recipient outside the pair: %j', (addressing) => {
    expect(
      isAgentChatDirectMessageAddressedWithinPair({ thread, ...addressing }),
    ).toBe(false);
  });
});
