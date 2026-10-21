import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { buildAgentChatThreadUpdateEvent } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-update-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const objectMetadata = getFlatObjectMetadataMock({
  universalIdentifier: 'agent-chat-thread',
  nameSingular: 'agentChatThread',
});

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const buildThread = (overrides: Partial<AgentChatThreadWorkspaceEntity>) =>
  Object.assign(new AgentChatThreadWorkspaceEntity(), {
    id: 'thread',
    title: 'Before',
    archivedAt: null,
    activeStreamId: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  });

describe('buildAgentChatThreadUpdateEvent', () => {
  it('describes what the write changed, leaving updatedAt out like the generic diff', () => {
    const threadBefore = buildThread({ activeStreamId: 'stream' });
    const threadAfter = buildThread({
      archivedAt: '2026-01-02T00:00:00.000Z',
      activeStreamId: null,
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    const event = buildAgentChatThreadUpdateEvent({
      threadBefore,
      threadAfter,
      objectMetadata,
      flatFieldMetadataMaps,
    });

    expect(event?.recordId).toBe('thread');
    expect(event?.properties.updatedFields?.sort()).toEqual([
      'activeStreamId',
      'archivedAt',
    ]);
    expect(event?.properties.diff).toEqual({
      archivedAt: { before: null, after: '2026-01-02T00:00:00.000Z' },
      activeStreamId: { before: 'stream', after: null },
    });
    expect(event?.properties.before).toBe(threadBefore);
    expect(event?.properties.after).toBe(threadAfter);
  });

  it('reports a bump of updatedAt alone, which reorders conversation lists', () => {
    const event = buildAgentChatThreadUpdateEvent({
      threadBefore: buildThread({}),
      threadAfter: buildThread({ updatedAt: '2026-01-02T00:00:00.000Z' }),
      objectMetadata,
      flatFieldMetadataMaps,
    });

    expect(event?.properties.updatedFields).toEqual(['updatedAt']);
    expect(event?.properties.diff).toEqual({
      updatedAt: {
        before: '2026-01-01T00:00:00.000Z',
        after: '2026-01-02T00:00:00.000Z',
      },
    });
  });

  it('builds no event when the thread did not change', () => {
    expect(
      buildAgentChatThreadUpdateEvent({
        threadBefore: buildThread({}),
        threadAfter: buildThread({}),
        objectMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });
});
