import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';

describe('ViewEntityLookupService', () => {
  let service: ViewEntityLookupService;
  let mockFlatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

  beforeEach(() => {
    mockFlatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

    service = new ViewEntityLookupService(mockFlatEntityMapsCacheService);
  });

  it('should find viewId for viewFieldGroup when entity exists in flat maps', async () => {
    const workspaceId = 'ws-test-id';
    const entityId = 'vfg-123';
    const expectedViewId = 'view-456';
    const universalIdentifier = 'ui-vfg-123';

    mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatViewFieldGroupMaps: {
          universalIdentifierById: {
            [entityId]: universalIdentifier,
          },
          byUniversalIdentifier: {
            [universalIdentifier]: {
              id: entityId,
              viewId: expectedViewId,
            } as any,
          },
        } as any,
      } as any,
    );

    const result = await service.findViewIdByEntityIdAndKind(
      'viewFieldGroup',
      entityId,
      workspaceId,
    );

    expect(result).toBe(expectedViewId);
    expect(
      mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId,
      flatMapsKeys: ['flatViewFieldGroupMaps'],
    });
  });

  it('should return null for viewFieldGroup when entity does not exist in flat maps', async () => {
    const workspaceId = 'ws-test-id';
    const entityId = 'vfg-nonexistent';

    mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValueOnce(
      {
        flatViewFieldGroupMaps: {
          universalIdentifierById: {},
          byUniversalIdentifier: {},
        } as any,
      } as any,
    );

    const result = await service.findViewIdByEntityIdAndKind(
      'viewFieldGroup',
      entityId,
      workspaceId,
    );

    expect(result).toBeNull();
    expect(
      mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId,
      flatMapsKeys: ['flatViewFieldGroupMaps'],
    });
  });
});
