import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { addAgentMessageSenderWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-history/utils/add-agent-message-sender-workspace-member.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({ getWorkspaceContext: jest.fn() }),
);

const setup = (hasRelation = true) => {
  jest.mocked(getWorkspaceContext).mockReturnValue({
    flatFieldMetadataMaps: {
      byUniversalIdentifier: hasRelation
        ? {
            [STANDARD_OBJECTS.agentMessage.fields.senderWorkspaceMember
              .universalIdentifier]: {},
          }
        : {},
    },
  } as never);
  const query = jest
    .fn()
    .mockResolvedValue([{ membershipId: 'sender', memberId: 'member' }]);
  const expand = (
    values: Record<string, unknown> | Record<string, unknown>[],
  ) =>
    addAgentMessageSenderWorkspaceMember(
      values,
      '20202020-1111-4111-8111-111111111111',
      { manager: { query } } as never,
    );
  return { query, expand };
};

describe('sender workspace member expansion', () => {
  it('preserves complete legacy attribution before the relation is available', async () => {
    const { query, expand } = setup(false);
    const message = {
      senderUserWorkspaceId: 'sender',
      senderApplicationId: 'application',
    };
    expect(await expand(message)).toEqual(message);
    expect(query).not.toHaveBeenCalled();
  });
  it('dual-writes members in a batch without changing sender or application IDs', async () => {
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
});
