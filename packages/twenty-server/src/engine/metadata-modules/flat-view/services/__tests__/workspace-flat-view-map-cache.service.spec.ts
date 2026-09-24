import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

describe('WorkspaceFlatViewMapCacheService', () => {
  it('keeps sort priority in creation order when rebuilding the cache from shuffled rows', () => {
    const service = new WorkspaceFlatViewMapCacheService();
    const view = Object.assign(new ViewEntity(), {
      id: 'view-id',
      universalIdentifier: 'view-universal-id',
      applicationId: 'application-id',
      objectMetadataId: 'object-id',
    });
    const oldestSort = {
      id: 'oldest-sort',
      universalIdentifier: 'oldest-sort-universal-id',
      viewId: view.id,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const newestSort = {
      id: 'newest-sort',
      universalIdentifier: 'newest-sort-universal-id',
      viewId: view.id,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    const shuffledSorts = [newestSort, oldestSort];
    const emptyGroupedRows = { rows: [], byViewId: new Map() };

    const flatViewMaps = service.computeForCache({
      workspaceId: 'workspace-id',
      rows: {
        view: [view],
        application: [
          {
            id: view.applicationId,
            universalIdentifier: 'application-universal-id',
          },
        ],
        objectMetadata: [
          {
            id: view.objectMetadataId,
            universalIdentifier: 'object-universal-id',
          },
        ],
        fieldMetadata: [],
        viewField: emptyGroupedRows,
        viewFilter: emptyGroupedRows,
        viewGroup: emptyGroupedRows,
        viewFilterGroup: emptyGroupedRows,
        viewFieldGroup: emptyGroupedRows,
        navigationMenuItem: emptyGroupedRows,
        viewSort: {
          rows: shuffledSorts,
          byViewId: new Map([[view.id, shuffledSorts]]),
        },
      },
    });

    expect(
      flatViewMaps.byUniversalIdentifier[view.universalIdentifier],
    ).toMatchObject({
      viewSortIds: [oldestSort.id, newestSort.id],
      viewSortUniversalIdentifiers: [
        oldestSort.universalIdentifier,
        newestSort.universalIdentifier,
      ],
    });
  });
});
