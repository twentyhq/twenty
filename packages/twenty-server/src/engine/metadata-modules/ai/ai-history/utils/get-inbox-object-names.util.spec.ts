import { FeatureFlagKey } from 'twenty-shared/types';

import { getInboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/utils/get-inbox-object-names.util';

describe('getInboxObjectNames', () => {
  it('keeps the legacy names while the workspace flag is off', () => {
    expect(getInboxObjectNames({})).toEqual({
      agentChatThread: 'agentChatThread',
      agentChatThreadParticipant: 'agentChatThreadParticipant',
      agentChatThreadTarget: 'agentChatThreadTarget',
      agentMessage: 'agentMessage',
      agentMessagePart: 'agentMessagePart',
      agentMessageReaction: 'agentMessageReaction',
      agentTurn: 'agentTurn',
    });
  });

  it('returns the inbox names once the workspace flag is on', () => {
    expect(
      getInboxObjectNames({
        [FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]: true,
      }),
    ).toEqual({
      agentChatThread: 'inboxThread',
      agentChatThreadParticipant: 'inboxThreadParticipant',
      agentChatThreadTarget: 'inboxThreadTarget',
      agentMessage: 'inboxMessage',
      agentMessagePart: 'inboxMessagePart',
      agentMessageReaction: 'inboxMessageReaction',
      agentTurn: 'agentTurn',
    });
  });
});
