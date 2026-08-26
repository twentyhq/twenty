import { type DataSource, type EntityTarget } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { WorkspaceCacheRowsBatchLoader } from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';

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

    const dataSource = {
      getRepository: jest.fn((entityTarget: EntityTarget<object>) => ({
        find: findMocksByEntity.get(entityTarget),
      })),
    } as unknown as DataSource;

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
    });
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

  it('treats an already-covered later resolution as a no-op', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([
      { objectMetadata: ['id', 'nameSingular'] },
    ]);
    const firstRows = rowsBatchLoader.readRows({
      objectMetadata: ['id'],
    }).objectMetadata;

    await rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]);

    expect(findMocksByEntity.get(ObjectMetadataEntity)).toHaveBeenCalledTimes(
      1,
    );
    expect(
      rowsBatchLoader.readRows({ objectMetadata: ['id'] }).objectMetadata,
    ).toBe(firstRows);
  });

  it('refetches with the widened union when a later resolution is not covered', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]);
    await rowsBatchLoader.loadRows([{ objectMetadata: ['nameSingular'] }]);

    const findMock = findMocksByEntity.get(ObjectMetadataEntity)!;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(findMock.mock.calls[1][0].select).toHaveLength(2);
    expect(findMock.mock.calls[1][0].select).toEqual(
      expect.arrayContaining(['id', 'nameSingular']),
    );
  });

  it('shares one query across concurrent resolutions of the same entity', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();

    await Promise.all([
      rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]),
      rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]),
    ]);

    expect(findMocksByEntity.get(ObjectMetadataEntity)).toHaveBeenCalledTimes(
      1,
    );
  });

  it('keeps previously resolved rows readable while a widening refetch is in flight', async () => {
    const { rowsBatchLoader, findMocksByEntity } = setup();
    const findMock = findMocksByEntity.get(ObjectMetadataEntity)!;
    const initialRows = [{ id: 'first-generation', workspaceId: WORKSPACE_ID }];
    const widenedRows = [
      {
        id: 'first-generation',
        nameSingular: 'widened',
        workspaceId: WORKSPACE_ID,
      },
    ];

    findMock
      .mockResolvedValueOnce(initialRows)
      .mockResolvedValueOnce(widenedRows);

    await rowsBatchLoader.loadRows([{ objectMetadata: ['id'] }]);

    const wideningPromise = rowsBatchLoader.loadRows([
      { objectMetadata: ['id', 'nameSingular'] },
    ]);

    expect(
      rowsBatchLoader.readRows({ objectMetadata: ['id'] }).objectMetadata,
    ).toBe(initialRows);

    await wideningPromise;

    expect(findMock).toHaveBeenCalledTimes(2);
    expect(
      rowsBatchLoader.readRows({ objectMetadata: ['id'] }).objectMetadata,
    ).toBe(widenedRows);
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
});
