import { type EntityTarget } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { FLAT_VIEW_ROWS_REQUIREMENT } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import {
  WorkspaceCacheRowsBatchLoader,
  type WorkspaceCacheRowsSource,
} from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

// `flatView.viewSortIds` is positional -- the front maps it straight into
// `orderBy` -- so the production requirement must pin an explicit order.
// Driving the real requirement through the real batch loader means dropping
// that declaration fails here, which a generic order test would not catch.
describe('FLAT_VIEW_ROWS_REQUIREMENT', () => {
  const setup = () => {
    const findMocksByEntity = new Map<EntityTarget<object>, jest.Mock>();

    const dataSource: WorkspaceCacheRowsSource = {
      getRepository: (entityTarget: EntityTarget<object>) => {
        const existingFindMock = findMocksByEntity.get(entityTarget);

        if (existingFindMock !== undefined) {
          return { find: existingFindMock };
        }

        const findMock = jest.fn().mockResolvedValue([]);

        findMocksByEntity.set(entityTarget, findMock);

        return { find: findMock };
      },
    };

    return {
      rowsBatchLoader: new WorkspaceCacheRowsBatchLoader(
        dataSource,
        WORKSPACE_ID,
      ),
      findMocksByEntity,
    };
  };

  it('fetches view sorts ordered by creation, tie-broken on id', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([FLAT_VIEW_ROWS_REQUIREMENT]);

    const viewSortFindMock = findMocksByEntity.get(ViewSortEntity);

    expect(viewSortFindMock).toHaveBeenCalledTimes(1);
    expect(viewSortFindMock?.mock.calls[0][0].order).toEqual({
      createdAt: 'ASC',
      id: 'ASC',
    });
  });

  it('matches the order the direct view sort read path already uses', () => {
    // ViewSortService.findByViewId / findByWorkspaceId both read with
    // `{ createdAt: 'ASC', id: 'ASC' }`. The cached path has to agree with them,
    // otherwise the same view answers differently depending on cache state.
    expect(FLAT_VIEW_ROWS_REQUIREMENT.viewSort.order).toEqual({
      createdAt: 'ASC',
      id: 'ASC',
    });
  });

  it('leaves the other view children unordered, keeping the change scoped', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([FLAT_VIEW_ROWS_REQUIREMENT]);

    expect(
      findMocksByEntity.get(ViewFieldEntity)?.mock.calls[0][0].order,
    ).toBeUndefined();
  });
});
