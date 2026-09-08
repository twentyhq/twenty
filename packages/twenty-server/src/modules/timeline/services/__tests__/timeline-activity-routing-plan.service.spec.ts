import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

const MAX_CACHED_WORKSPACES = 128;

const emptyFlatEntityMaps = () => ({
  byId: {},
  byUniversalIdentifier: {},
  idByUniversalIdentifier: {},
});

const flatObjectMetadata = {
  id: 'object-metadata-id',
  isAuditLogged: false,
} as FlatObjectMetadata;

describe('TimelineActivityRoutingPlanService', () => {
  let service: TimelineActivityRoutingPlanService;
  let getOrRecompute: jest.Mock;

  const cachedWorkspaceIds = (): string[] =>
    Array.from(service['routingPlanByWorkspaceId'].keys());

  beforeEach(async () => {
    getOrRecompute = jest.fn().mockResolvedValue({
      data: {
        flatObjectMetadataMaps: emptyFlatEntityMaps(),
        flatFieldMetadataMapsOrm: emptyFlatEntityMaps(),
        flatTimelineActivityTypeMaps: emptyFlatEntityMaps(),
      },
      hashes: {
        flatObjectMetadataMaps: 'hash-a',
        flatFieldMetadataMapsOrm: 'hash-b',
        flatTimelineActivityTypeMaps: 'hash-c',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineActivityRoutingPlanService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMapsWithHashes: getOrRecompute,
          },
        },
      ],
    }).compile();

    service = module.get(TimelineActivityRoutingPlanService);
  });

  it('reuses the cached routing plan for a workspace', async () => {
    await service.shouldProcessEvent({ flatObjectMetadata, workspaceId: 'ws' });
    await service.shouldProcessEvent({ flatObjectMetadata, workspaceId: 'ws' });

    expect(cachedWorkspaceIds()).toEqual(['ws']);
  });

  it('bounds the cache when more workspaces than the cap are routed', async () => {
    for (let index = 0; index < MAX_CACHED_WORKSPACES + 50; index += 1) {
      await service.shouldProcessEvent({
        flatObjectMetadata,
        workspaceId: `ws-${index}`,
      });
    }

    expect(service['routingPlanByWorkspaceId'].size).toBe(
      MAX_CACHED_WORKSPACES,
    );
    expect(cachedWorkspaceIds()).not.toContain('ws-0');
    expect(cachedWorkspaceIds()).toContain(
      `ws-${MAX_CACHED_WORKSPACES + 50 - 1}`,
    );
  });

  it('evicts the least recently used workspace, not the oldest inserted', async () => {
    for (let index = 0; index < MAX_CACHED_WORKSPACES; index += 1) {
      await service.shouldProcessEvent({
        flatObjectMetadata,
        workspaceId: `ws-${index}`,
      });
    }

    await service.shouldProcessEvent({
      flatObjectMetadata,
      workspaceId: 'ws-0',
    });
    await service.shouldProcessEvent({
      flatObjectMetadata,
      workspaceId: 'ws-new',
    });

    expect(cachedWorkspaceIds()).toContain('ws-0');
    expect(cachedWorkspaceIds()).not.toContain('ws-1');
  });
});
