import { FeatureFlagKey } from 'twenty-shared/types';

import { getInboxObjectNamesByLegacyName } from 'src/engine/metadata-modules/ai/ai-history/utils/get-inbox-object-names-by-legacy-name.util';

describe('getInboxObjectNamesByLegacyName', () => {
  it('keeps the legacy names while the workspace flag is off', () => {
    expect(getInboxObjectNamesByLegacyName({})).toEqual({
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
      getInboxObjectNamesByLegacyName({
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
