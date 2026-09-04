import { IsNull, Not, type EntityTarget } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import {
  WorkspaceCacheRowsBatchLoader,
  type WorkspaceCacheRowsSource,
} from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

describe('WorkspaceCacheRowsBatchLoader', () => {
  const setup = () => {
    const findMocksByEntity = new Map<EntityTarget<object>, jest.Mock>([
      [
        ObjectMetadataEntity,
        jest
          .fn()
          .mockResolvedValue([{ id: 'object-row', workspaceId: WORKSPACE_ID }]),
      ],
      [
        ApplicationEntity,
        jest.fn().mockResolvedValue([
          {
            id: 'application-row',
            workspaceId: WORKSPACE_ID,
          },
        ]),
      ],
      [
        ViewFieldEntity,
        jest
          .fn()
          .mockResolvedValue([
            { id: 'view-field-row', workspaceId: WORKSPACE_ID },
          ]),
      ],
    ]);

    const dataSource: WorkspaceCacheRowsSource = {
      getRepository: jest.fn((entityTarget: EntityTarget<object>) => ({
        find: findMocksByEntity.get(entityTarget)!,
      })),
    };

    return {
      rowsBatchLoader: new WorkspaceCacheRowsBatchLoader(
        dataSource,
        WORKSPACE_ID,
      ),
      findMocksByEntity,
    };
  };

  it('fetches all workspace rows including soft-deleted ones', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: true }]);

    expect(
      rowsBatchLoader.readRows({ objectMetadata: true }).objectMetadata,
    ).toEqual([{ id: 'object-row', workspaceId: WORKSPACE_ID }]);
    expect(findMocksByEntity.get(ObjectMetadataEntity)).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID },
      withDeleted: true,
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  });

  // Cache providers freeze row order into their flat maps, and for ordered
  // collections the array index carries meaning - a view's sort priority is its
  // position in `viewSortIds`. An unordered find returns physical row order,
  // which is not stable across recomputes, so a multi-column sort could flip on
  // a plain restart. See twentyhq/twenty#25262.
  it('falls back to creation order for entities without a position column', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([
      { objectMetadata: true, application: true },
    ]);

    for (const entity of [ObjectMetadataEntity, ApplicationEntity]) {
      const findMock = findMocksByEntity.get(entity)!;

      expect(findMock).toHaveBeenCalledTimes(1);
      expect(findMock.mock.calls[0][0].order).toEqual({
        createdAt: 'ASC',
        id: 'ASC',
      });
    }
  });

  // View fields persist a user-facing order in `position`, and view filters and
  // filter groups in `positionInViewFilterGroup`. Reading them back by creation
  // time would revert a reordered column on the next cache recompute, so the
  // persisted position leads and creation order only breaks ties.
  it('reads collections that persist a position back in that order', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([{ viewField: ['id'] }]);

    expect(
      findMocksByEntity.get(ViewFieldEntity)!.mock.calls[0][0].order,
    ).toEqual({ position: 'ASC', createdAt: 'ASC', id: 'ASC' });
  });

  it('merges requirements into one query per entity with the union of declared columns', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([
      { objectMetadata: ['id'] },
      {
        objectMetadata: ['id', 'nameSingular'],
        application: ['id', 'universalIdentifier'],
      },
    ]);

    const objectFindMock = findMocksByEntity.get(ObjectMetadataEntity)!;

    expect(objectFindMock).toHaveBeenCalledTimes(1);
    expect(objectFindMock.mock.calls[0][0].select).toHaveLength(2);
    expect(objectFindMock.mock.calls[0][0].select).toEqual(
      expect.arrayContaining(['id', 'nameSingular']),
    );
    expect(findMocksByEntity.get(ApplicationEntity)).toHaveBeenCalledTimes(1);
  });

  it('drops the column selection once any requirement needs full rows', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([
      { objectMetadata: ['id'] },
      { objectMetadata: true },
    ]);

    const findMock = findMocksByEntity.get(ObjectMetadataEntity)!;

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toBeUndefined();
  });

  it('throws when loadRows is called more than once', async () => {
    const { rowsBatchLoader } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]);

    await expect(
      rowsBatchLoader.loadRows([{ objectMetadata: ['nameSingular'] }]),
    ).rejects.toThrow(/single loadRows call/);
  });

  it('widens the fetched columns with the declared groupBy keys', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([
      {
        viewField: {
          columns: ['id'],
          groupBy: ['fieldMetadataId'],
        },
      },
    ]);

    const findMock = findMocksByEntity.get(ViewFieldEntity)!;

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toHaveLength(2);
    expect(findMock.mock.calls[0][0].select).toEqual(
      expect.arrayContaining(['id', 'fieldMetadataId']),
    );
  });

  it('returns rows and grouped maps for a groupBy declaration, skipping null foreign keys', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();
    const rows = [
      {
        id: 'view-field-a',
        fieldMetadataId: 'field-1',
        workspaceId: WORKSPACE_ID,
      },
      {
        id: 'view-field-b',
        fieldMetadataId: 'field-1',
        workspaceId: WORKSPACE_ID,
      },
      {
        id: 'view-field-c',
        fieldMetadataId: null,
        workspaceId: WORKSPACE_ID,
      },
    ];

    findMocksByEntity.get(ViewFieldEntity)!.mockResolvedValue(rows);

    const rowsRequirement = {
      viewField: {
        columns: ['id'],
        groupBy: ['fieldMetadataId'],
      },
    } as const;

    await rowsBatchLoader.loadRows([rowsRequirement]);

    const { viewField } = rowsBatchLoader.readRows(rowsRequirement);

    expect(viewField.rows).toBe(rows);
    expect(viewField.byFieldMetadataId.get('field-1')).toEqual([
      rows[0],
      rows[1],
    ]);
    expect([...viewField.byFieldMetadataId.keys()]).toEqual(['field-1']);

    expect(viewField.rows[0].fieldMetadataId).toBe('field-1');
    // @ts-expect-error an undeclared column is a compile error, not undefined
    void viewField.rows[0].isVisible;
  });

  it('memoizes grouped maps across readRows calls for the same entity and foreign key', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    findMocksByEntity.get(ViewFieldEntity)!.mockResolvedValue([
      {
        id: 'view-field-a',
        fieldMetadataId: 'field-1',
        workspaceId: WORKSPACE_ID,
      },
    ]);

    const rowsRequirement = {
      viewField: {
        columns: ['id'],
        groupBy: ['fieldMetadataId'],
      },
    } as const;

    await rowsBatchLoader.loadRows([rowsRequirement]);

    const firstRead = rowsBatchLoader.readRows(rowsRequirement);
    const secondRead = rowsBatchLoader.readRows(rowsRequirement);

    expect(secondRead.viewField.byFieldMetadataId).toBe(
      firstRead.viewField.byFieldMetadataId,
    );
  });

  it('types plain rows as exactly the declared columns', async () => {
    const { rowsBatchLoader } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]);

    const { objectMetadata } = rowsBatchLoader.readRows({
      objectMetadata: ['id'],
    } as const);

    expect(objectMetadata[0].id).toBe('object-row');
    // @ts-expect-error an undeclared column is a compile error, not undefined
    void objectMetadata[0].nameSingular;
  });

  it('throws when reading an entity name no requirement declared', async () => {
    const { rowsBatchLoader } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: true }]);

    expect(() => rowsBatchLoader.readRows({ application: ['id'] })).toThrow(
      /application.*rowsRequirement/,
    );
  });

  it('returns plain picked rows for an object requirement without groupBy', async () => {
    const { rowsBatchLoader } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: { columns: ['id'] } }]);

    const { objectMetadata } = rowsBatchLoader.readRows({
      objectMetadata: { columns: ['id'] },
    } as const);

    expect(objectMetadata[0].id).toBe('object-row');
    // @ts-expect-error an undeclared column is a compile error, not undefined
    void objectMetadata[0].nameSingular;
  });

  it('runs a separate query for a predicated requirement, merging the predicate into the where clause', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();
    const findMock = findMocksByEntity.get(ViewFieldEntity)!;
    const allRows = [{ id: 'view-field-all', workspaceId: WORKSPACE_ID }];
    const visibleRows = [
      { id: 'view-field-visible', workspaceId: WORKSPACE_ID },
    ];

    findMock.mockResolvedValueOnce(allRows).mockResolvedValueOnce(visibleRows);

    await rowsBatchLoader.loadRows([
      { viewField: ['id'] },
      { viewField: { columns: ['id'], where: { isVisible: true } } },
    ]);

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock.mock.calls[1][0].where).toEqual({
      isVisible: true,
      workspaceId: WORKSPACE_ID,
    });

    expect(rowsBatchLoader.readRows({ viewField: ['id'] }).viewField).toBe(
      allRows,
    );
    expect(
      rowsBatchLoader.readRows({
        viewField: { columns: ['id'], where: { isVisible: true } },
      }).viewField,
    ).toBe(visibleRows);
  });

  it('shares one query across structurally equal where clauses, whatever the instances', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();
    const findMock = findMocksByEntity.get(ViewFieldEntity)!;

    await rowsBatchLoader.loadRows([
      {
        viewField: {
          columns: ['id'],
          where: { isVisible: true, fieldMetadataId: Not(IsNull()) },
        },
      },
      {
        viewField: {
          columns: ['fieldMetadataId'],
          where: { fieldMetadataId: Not(IsNull()), isVisible: true },
        },
      },
    ]);

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock.mock.calls[0][0].select).toEqual(
      expect.arrayContaining(['id', 'fieldMetadataId']),
    );
  });

  it('runs separate queries for structurally different where clauses', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();
    const findMock = findMocksByEntity.get(ViewFieldEntity)!;

    await rowsBatchLoader.loadRows([
      { viewField: { columns: ['id'], where: { isVisible: true } } },
      { viewField: { columns: ['id'], where: { isVisible: false } } },
    ]);

    expect(findMock).toHaveBeenCalledTimes(2);
  });
});
