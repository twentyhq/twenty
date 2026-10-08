import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatRecordEventService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-record-event.service';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const FIELD_TYPES = {
  id: FieldMetadataType.UUID,
  title: FieldMetadataType.TEXT,
  updatedAt: FieldMetadataType.DATE_TIME,
  deletedAt: FieldMetadataType.DATE_TIME,
};

const objectMetadata = getFlatObjectMetadataMock({
  id: 'thread-object-id',
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  nameSingular: 'agentChatThread',
  fieldIds: Object.keys(FIELD_TYPES),
});

const fields = Object.entries(FIELD_TYPES).map(([name, type]) =>
  getFlatFieldMetadataMock({
    id: name,
    universalIdentifier: name,
    objectMetadataId: objectMetadata.id,
    name,
    type,
  }),
);

const buildService = () => {
  const emitDatabaseBatchEvent = jest.fn();
  const service = new AgentChatRecordEventService(
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [objectMetadata.universalIdentifier]: objectMetadata,
          },
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: Object.fromEntries(
            fields.map((field) => [field.universalIdentifier, field]),
          ),
          universalIdentifierById: Object.fromEntries(
            fields.map((field) => [field.id, field.universalIdentifier]),
          ),
          universalIdentifiersByApplicationId: {},
        },
      }),
    } as never,
    { emitDatabaseBatchEvent } as never,
  );

  const emit = async (before: object | null, after: object) => {
    await service.emit({
      workspaceId: 'workspace-id',
      objectName: 'agentChatThread',
      before,
      after,
    });

    return emitDatabaseBatchEvent.mock.calls.at(-1)?.[0];
  };

  return { emit, emitDatabaseBatchEvent };
};

const THREAD = {
  id: 'thread-id',
  title: 'Before',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('AgentChatRecordEventService', () => {
  it('sends a row with nothing before it as created, shaped like an ORM record', async () => {
    const { emit } = buildService();

    const event = await emit(null, { ...THREAD, title: null, raw: true });

    expect(event.action).toBe(DatabaseEventAction.CREATED);
    expect(event.events[0].properties.after).toEqual({ ...THREAD, title: '' });
  });

  it('sends a new updatedAt with the other changes', async () => {
    const { emit } = buildService();
    const after = {
      ...THREAD,
      title: 'After',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };

    const event = await emit(THREAD, after);

    expect(event.action).toBe(DatabaseEventAction.UPDATED);
    expect(event.events[0].properties.updatedFields).toEqual([
      'title',
      'updatedAt',
    ]);
    expect(event.events[0].properties.diff.updatedAt).toEqual({
      before: THREAD.updatedAt,
      after: after.updatedAt,
    });
  });

  it('sends a bump of updatedAt alone, which reorders chat lists', async () => {
    const { emit } = buildService();

    const event = await emit(THREAD, {
      ...THREAD,
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(event.action).toBe(DatabaseEventAction.UPDATED);
    expect(event.events[0].properties.updatedFields).toEqual(['updatedAt']);
  });

  it('sends a row brought back from the trash as restored', async () => {
    const { emit } = buildService();

    const event = await emit(
      { ...THREAD, deletedAt: '2026-01-01T00:00:00.000Z' },
      { ...THREAD, updatedAt: '2026-01-02T00:00:00.000Z' },
    );

    expect(event.action).toBe(DatabaseEventAction.RESTORED);
    expect(event.events[0].properties.updatedFields).toEqual([
      'deletedAt',
      'updatedAt',
    ]);
  });

  it('sends nothing when the row did not change', async () => {
    const { emit } = buildService();

    expect(await emit(THREAD, { ...THREAD })).toBeUndefined();
  });
});
