import {
  type EntityTarget,
  type FindManyOptions,
  type ObjectLiteral,
} from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheRowsBatchLoader } from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

describe('WorkspaceFlatViewMapCacheService', () => {
  it('orders view sort identifiers by creation time and id without mutating shared rows', async () => {
    const service = new WorkspaceFlatViewMapCacheService();
    const viewSorts = [
      { id: 'sort-a', createdAt: new Date('2026-01-02') },
      { id: 'sort-c', createdAt: new Date('2026-01-01') },
      { id: 'sort-b', createdAt: new Date('2026-01-01') },
    ].map((viewSort) => ({
      ...viewSort,
      universalIdentifier: `universal-${viewSort.id}`,
      viewId: 'view-1',
    }));
    const rowsByEntity = new Map<EntityTarget<ObjectLiteral>, ObjectLiteral[]>([
      [
        ViewEntity,
        [
          {
            id: 'view-1',
            universalIdentifier: 'universal-view-1',
            applicationId: 'application-1',
            objectMetadataId: 'object-1',
          },
        ],
      ],
      [
        ApplicationEntity,
        [
          {
            id: 'application-1',
            universalIdentifier: 'universal-application-1',
          },
        ],
      ],
      [
        ObjectMetadataEntity,
        [{ id: 'object-1', universalIdentifier: 'universal-object-1' }],
      ],
      [ViewSortEntity, viewSorts],
    ]);
    const rowsBatchLoader = new WorkspaceCacheRowsBatchLoader(
      {
        getRepository: (entityTarget) => ({
          find: jest.fn(async (options?: FindManyOptions<ObjectLiteral>) => {
            const rows = rowsByEntity.get(entityTarget) ?? [];

            return rows.map((row) =>
              Array.isArray(options?.select)
                ? Object.fromEntries(
                    options.select.map((column: string) => [
                      column,
                      row[column],
                    ]),
                  )
                : { ...row },
            );
          }),
        }),
      },
      WORKSPACE_ID,
    );

    await rowsBatchLoader.loadRows([service.rowsRequirement]);

    const rows = rowsBatchLoader.readRows(service.rowsRequirement);
    const sharedViewSorts = [...(rows.viewSort.byViewId.get('view-1') ?? [])];
    const flatViewMaps = service.computeForCache({
      workspaceId: WORKSPACE_ID,
      rows,
    });
    const flatView = flatViewMaps.byUniversalIdentifier['universal-view-1'];

    expect(flatView?.viewSortIds).toEqual(['sort-b', 'sort-c', 'sort-a']);
    expect(flatView?.viewSortUniversalIdentifiers).toEqual([
      'universal-sort-b',
      'universal-sort-c',
      'universal-sort-a',
    ]);
    expect(rows.viewSort.byViewId.get('view-1')).toEqual(sharedViewSorts);
    expect(rows.viewSort.rows.map(({ id }) => id)).toEqual([
      'sort-a',
      'sort-c',
      'sort-b',
    ]);
  });
});
