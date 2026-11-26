import { FeatureFlagKey } from 'twenty-shared/types';

import { InboxObjectNamesResolverService } from 'src/engine/metadata-modules/ai/ai-history/services/inbox-object-names-resolver.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const resolveWithFeatureFlags = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
) => {
  const getOrRecompute = jest.fn().mockResolvedValue({ featureFlagsMap });
  const resolver = new InboxObjectNamesResolverService({
    getOrRecompute,
  } as unknown as WorkspaceCacheService);

  return { getOrRecompute, objectNames: resolver.resolve('workspace') };
};

describe('InboxObjectNamesResolverService', () => {
  it('keeps the legacy names while the workspace flag is off', async () => {
    const { getOrRecompute, objectNames } = resolveWithFeatureFlags({});

    await expect(objectNames).resolves.toEqual({
      agentChatThread: 'agentChatThread',
      agentChatThreadParticipant: 'agentChatThreadParticipant',
      agentChatThreadTarget: 'agentChatThreadTarget',
      agentMessage: 'agentMessage',
      agentMessagePart: 'agentMessagePart',
      agentMessageReaction: 'agentMessageReaction',
      agentTurn: 'agentTurn',
    });
    expect(getOrRecompute).toHaveBeenCalledWith('workspace', [
      'featureFlagsMap',
    ]);
  });

  it('returns the inbox names once the workspace flag is on', async () => {
    const { objectNames } = resolveWithFeatureFlags({
      [FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]: true,
    });

    await expect(objectNames).resolves.toEqual({
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
