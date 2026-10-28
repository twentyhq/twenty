import { Test, type TestingModule } from '@nestjs/testing';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { ApplicationEventEmitterService } from 'src/engine/metadata-modules/event-metadata/services/application-event-emitter.service';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const WORKSPACE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const APPLICATION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EVENT_METADATA_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const FLAT_EVENT_METADATA: FlatEventMetadata = {
  id: EVENT_METADATA_ID,
  workspaceId: WORKSPACE_ID,
  universalIdentifier: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  name: 'agentTyping',
  label: 'Agent typing',
  description: null,
  icon: null,
  properties: [{ name: 'isTyping', type: 'BOOLEAN', isRequired: true }],
  capabilities: { realtime: { scopes: [{ kind: 'visitor' }] } },
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
};

describe('ApplicationEventEmitterService', () => {
  let service: ApplicationEventEmitterService;
  const publish = jest.fn();

  beforeEach(async () => {
    publish.mockReset();

    const flatEventMetadataMaps = createEmptyFlatEntityMaps();

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: FLAT_EVENT_METADATA,
      flatEntityMapsToMutate: flatEventMetadataMaps,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationEventEmitterService,
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatEventMetadataMaps,
              flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
            }),
          },
        },
        { provide: EventRealtimeService, useValue: { publish } },
      ],
    }).compile();

    service = module.get(ApplicationEventEmitterService);
  });

  it('should publish the occurrence on the visitor channel', async () => {
    const result = await service.emit({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      event: 'agentTyping',
      properties: { isTyping: true },
      anonymousId: 'visitor-1',
    });

    expect(publish).toHaveBeenCalledWith({
      channels: [
        `appEvent:${WORKSPACE_ID}:${EVENT_METADATA_ID}:visitor:visitor-1`,
      ],
      serializedOccurrence: JSON.stringify({
        id: result.id,
        type: 'agentTyping',
        occurredAt: result.occurredAt,
        properties: { isTyping: true },
      }),
    });
  });

  it('should refuse an event declared by another application', async () => {
    await expect(
      service.emit({
        workspaceId: WORKSPACE_ID,
        applicationId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        event: 'agentTyping',
        properties: { isTyping: true },
        anonymousId: null,
      }),
    ).rejects.toMatchObject({
      code: EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
    });
    expect(publish).not.toHaveBeenCalled();
  });

  it('should refuse properties that do not match the definition', async () => {
    await expect(
      service.emit({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        event: 'agentTyping',
        properties: { isTyping: 'yes' },
        anonymousId: null,
      }),
    ).rejects.toThrow(EventMetadataException);
    expect(publish).not.toHaveBeenCalled();
  });
});
