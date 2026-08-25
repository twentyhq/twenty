// Opt-in benchmark (skipped unless BENCHMARK_PG_URL is set): compares the
// previous per-provider fetch implementation of flatObjectMetadataMaps +
// flatFieldMetadataMaps against the shared WorkspaceCacheRecomputeContext one,
// on a dev-seeded database. Run from packages/twenty-server:
//   BENCHMARK_PG_URL=postgres://... npx jest src/engine/workspace-cache/services/__tests__/cache-recompute-benchmark.spec.ts --config=jest.config.mjs
import {
  DataSource,
  type DataSourceOptions,
  type Logger as TypeOrmLogger,
} from 'typeorm';

import { typeORMCoreModuleOptions } from 'src/database/typeorm/core/core.datasource';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceFlatFieldMetadataMapCacheService } from 'src/engine/metadata-modules/flat-field-metadata/services/workspace-flat-field-metadata-map-cache.service';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { WorkspaceFlatObjectMetadataMapCacheService } from 'src/engine/metadata-modules/flat-object-metadata/services/workspace-flat-object-metadata-map-cache.service';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { computeUniqueFieldMetadataIdsFromIndexEntities } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-index-entities.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

jest.setTimeout(600_000);

class QueryCountingLogger implements TypeOrmLogger {
  queryCount = 0;
  logQuery() {
    this.queryCount++;
  }
  logQueryError() {}
  logQuerySlow() {}
  logSchemaBuild() {}
  logMigration() {}
  log() {}
}

// Previous flatObjectMetadataMaps computeForCache, verbatim query set (8 finds)
// with WorkspaceScopedRepository calls inlined as plain workspaceId filters.
const previousObjectComputeForCache = async (
  dataSource: DataSource,
  workspaceId: string,
) => {
  const [
    objectMetadatas,
    applications,
    fields,
    indexMetadatas,
    views,
    objectPermissions,
    searchFieldMetadatas,
    pageLayouts,
  ] = await Promise.all([
    dataSource
      .getRepository(ObjectMetadataEntity)
      .find({ where: { workspaceId }, withDeleted: true }),
    dataSource.getRepository(ApplicationEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier'],
      withDeleted: true,
    }),
    dataSource.getRepository(FieldMetadataEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(IndexMetadataEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(ViewEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(ObjectPermissionEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(SearchFieldMetadataEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
    }),
    dataSource.getRepository(PageLayoutEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'objectMetadataId'],
      withDeleted: true,
    }),
  ]);

  const [
    fieldsByObjectId,
    indexesByObjectId,
    viewsByObjectId,
    objectPermissionsByObjectId,
    searchFieldMetadatasByObjectId,
    pageLayoutsByObjectId,
  ] = (
    [
      { entities: fields, foreignKey: 'objectMetadataId' },
      { entities: indexMetadatas, foreignKey: 'objectMetadataId' },
      { entities: views, foreignKey: 'objectMetadataId' },
      { entities: objectPermissions, foreignKey: 'objectMetadataId' },
      { entities: searchFieldMetadatas, foreignKey: 'objectMetadataId' },
      { entities: pageLayouts, foreignKey: 'objectMetadataId' },
    ] as const
  ).map(regroupEntitiesByRelatedEntityId);

  const applicationIdToUniversalIdentifierMap =
    createIdToUniversalIdentifierMap(applications);
  const fieldMetadataIdToUniversalIdentifierMap =
    createIdToUniversalIdentifierMap(fields);

  const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

  for (const objectMetadataEntity of objectMetadatas) {
    const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
      entity: {
        ...objectMetadataEntity,
        fields: fieldsByObjectId.get(objectMetadataEntity.id) || [],
        indexMetadatas: indexesByObjectId.get(objectMetadataEntity.id) || [],
        views: viewsByObjectId.get(objectMetadataEntity.id) || [],
        objectPermissions:
          objectPermissionsByObjectId.get(objectMetadataEntity.id) || [],
        searchFieldMetadatas:
          searchFieldMetadatasByObjectId.get(objectMetadataEntity.id) || [],
        pageLayouts: pageLayoutsByObjectId.get(objectMetadataEntity.id) || [],
      },
      applicationIdToUniversalIdentifierMap,
      fieldMetadataIdToUniversalIdentifierMap,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: flatObjectMetadata,
      flatEntityMapsToMutate: flatObjectMetadataMaps,
    });
  }

  return flatObjectMetadataMaps;
};

// Previous flatFieldMetadataMaps computeForCache, verbatim query set (9 finds).
const previousFieldComputeForCache = async (
  dataSource: DataSource,
  workspaceId: string,
) => {
  const [
    fieldMetadatas,
    indexMetadatas,
    objectMetadatas,
    applications,
    viewFields,
    viewFilters,
    viewSorts,
    views,
    searchFieldMetadatas,
  ] = await Promise.all([
    dataSource
      .getRepository(FieldMetadataEntity)
      .find({ where: { workspaceId }, withDeleted: true }),
    dataSource.getRepository(IndexMetadataEntity).find({
      where: { workspaceId, isUnique: true },
      relations: ['indexFieldMetadatas'],
      withDeleted: true,
    }),
    dataSource.getRepository(ObjectMetadataEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier'],
      withDeleted: true,
    }),
    dataSource.getRepository(ApplicationEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier'],
      withDeleted: true,
    }),
    dataSource.getRepository(ViewFieldEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'fieldMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(ViewFilterEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'fieldMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(ViewSortEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'fieldMetadataId'],
      withDeleted: true,
    }),
    dataSource.getRepository(ViewEntity).find({
      where: { workspaceId },
      select: [
        'id',
        'universalIdentifier',
        'kanbanAggregateOperationFieldMetadataId',
        'calendarFieldMetadataId',
        'calendarEndFieldMetadataId',
        'mainGroupByFieldMetadataId',
      ],
      withDeleted: true,
    }),
    dataSource.getRepository(SearchFieldMetadataEntity).find({
      where: { workspaceId },
      select: ['id', 'universalIdentifier', 'fieldMetadataId'],
    }),
  ]);

  const [
    viewFieldsByFieldId,
    viewFiltersByFieldId,
    calendarViewsByFieldId,
    calendarEndViewsByFieldId,
    kanbanViewsByFieldId,
    mainGroupByFieldMetadataViewsByFieldId,
    viewSortsByFieldId,
    searchFieldMetadatasByFieldId,
  ] = (
    [
      { entities: viewFields, foreignKey: 'fieldMetadataId' },
      { entities: viewFilters, foreignKey: 'fieldMetadataId' },
      { entities: views, foreignKey: 'calendarFieldMetadataId' },
      { entities: views, foreignKey: 'calendarEndFieldMetadataId' },
      { entities: views, foreignKey: 'kanbanAggregateOperationFieldMetadataId' },
      { entities: views, foreignKey: 'mainGroupByFieldMetadataId' },
      { entities: viewSorts, foreignKey: 'fieldMetadataId' },
      { entities: searchFieldMetadatas, foreignKey: 'fieldMetadataId' },
    ] as const
  ).map(regroupEntitiesByRelatedEntityId);

  const fieldMetadataIdToUniversalIdentifierMap =
    createIdToUniversalIdentifierMap(fieldMetadatas);
  const objectMetadataIdToUniversalIdentifierMap =
    createIdToUniversalIdentifierMap(objectMetadatas);
  const applicationIdToUniversalIdentifierMap =
    createIdToUniversalIdentifierMap(applications);

  const uniqueFieldMetadataIds =
    computeUniqueFieldMetadataIdsFromIndexEntities(indexMetadatas);

  const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

  for (const fieldMetadataEntity of fieldMetadatas) {
    const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
      entity: {
        ...fieldMetadataEntity,
        viewFields: viewFieldsByFieldId.get(fieldMetadataEntity.id) || [],
        viewFilters: viewFiltersByFieldId.get(fieldMetadataEntity.id) || [],
        kanbanAggregateOperationViews:
          kanbanViewsByFieldId.get(fieldMetadataEntity.id) || [],
        calendarViews: calendarViewsByFieldId.get(fieldMetadataEntity.id) || [],
        calendarEndViews:
          calendarEndViewsByFieldId.get(fieldMetadataEntity.id) || [],
        mainGroupByFieldMetadataViews:
          mainGroupByFieldMetadataViewsByFieldId.get(fieldMetadataEntity.id) ||
          [],
        viewSorts: viewSortsByFieldId.get(fieldMetadataEntity.id) || [],
        searchFieldMetadatas:
          searchFieldMetadatasByFieldId.get(fieldMetadataEntity.id) || [],
      },
      fieldMetadataIdToUniversalIdentifierMap,
      objectMetadataIdToUniversalIdentifierMap,
      applicationIdToUniversalIdentifierMap,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: {
        ...flatFieldMetadata,
        isUnique: uniqueFieldMetadataIds.has(fieldMetadataEntity.id),
      },
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }

  return flatFieldMetadataMaps;
};

const quantile = (sortedValues: number[], q: number) =>
  sortedValues[
    Math.min(
      sortedValues.length - 1,
      Math.floor(sortedValues.length * q),
    )
  ];

const summarize = (durations: number[]) => {
  const sorted = [...durations].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(quantile(sorted, 0.5).toFixed(2)),
    p95: Number(quantile(sorted, 0.95).toFixed(2)),
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[sorted.length - 1].toFixed(2)),
  };
};

// Sorts string-array aggregators so the (already unspecified) DB row order
// cannot fail the old-vs-new equivalence check.
const normalizeMaps = (maps: ReturnType<typeof createEmptyFlatEntityMaps>) =>
  JSON.parse(
    JSON.stringify(maps, (_key, value) =>
      Array.isArray(value) &&
      value.every((element) => typeof element === 'string')
        ? [...value].sort()
        : value,
    ),
  );

const describeIfBenchmarkDatabase = process.env.BENCHMARK_PG_URL
  ? describe
  : describe.skip;

describeIfBenchmarkDatabase(
  'cache recompute benchmark: previous vs shared-context',
  () => {
  it('benchmarks object + field cache recomputation', async () => {
    const logger = new QueryCountingLogger();
    const dataSource = new DataSource({
      ...(typeORMCoreModuleOptions as DataSourceOptions),
      url: process.env.BENCHMARK_PG_URL,
      logging: ['query'],
      logger,
    } as DataSourceOptions);

    await dataSource.initialize();

    try {
      const [{ workspaceId, fieldCount }] = await dataSource.query(
        `SELECT "workspaceId", count(*)::int AS "fieldCount" FROM core."fieldMetadata" GROUP BY "workspaceId" ORDER BY count(*) DESC LIMIT 1`,
      );

      const tableCounts: Record<string, number> = {};

      for (const table of [
        'objectMetadata',
        'fieldMetadata',
        'indexMetadata',
        'indexFieldMetadata',
        'view',
        'viewField',
        'viewFilter',
        'viewSort',
        'objectPermission',
        'searchFieldMetadata',
        'pageLayout',
        'application',
      ]) {
        const [{ count }] = await dataSource.query(
          `SELECT count(*)::int AS count FROM core."${table}" WHERE "workspaceId" = $1`,
          [workspaceId],
        );

        tableCounts[table] = count;
      }

      const objectService = new WorkspaceFlatObjectMetadataMapCacheService();
      const fieldService = new WorkspaceFlatFieldMetadataMapCacheService();

      const runPrevious = {
        'batch object+field': () =>
          Promise.all([
            previousObjectComputeForCache(dataSource, workspaceId),
            previousFieldComputeForCache(dataSource, workspaceId),
          ]),
        'object solo': () =>
          previousObjectComputeForCache(dataSource, workspaceId),
        'field solo': () =>
          previousFieldComputeForCache(dataSource, workspaceId),
      };
      const runShared = {
        'batch object+field': () => {
          const recomputeContext = new WorkspaceCacheRecomputeContext(
            dataSource,
            workspaceId,
          );

          return Promise.all([
            objectService.computeForCache(workspaceId, recomputeContext),
            fieldService.computeForCache(workspaceId, recomputeContext),
          ]);
        },
        'object solo': () =>
          objectService.computeForCache(
            workspaceId,
            new WorkspaceCacheRecomputeContext(dataSource, workspaceId),
          ),
        'field solo': () =>
          fieldService.computeForCache(
            workspaceId,
            new WorkspaceCacheRecomputeContext(dataSource, workspaceId),
          ),
      };
      const scenarios = Object.keys(
        runPrevious,
      ) as (keyof typeof runPrevious)[];

      // Equivalence check before timing anything.
      const [previousObjectMaps, previousFieldMaps] = await runPrevious[
        'batch object+field'
      ]();
      const [sharedObjectMaps, sharedFieldMaps] = (await runShared[
        'batch object+field'
      ]()) as [
        typeof previousObjectMaps,
        typeof previousFieldMaps,
      ];

      expect(normalizeMaps(sharedObjectMaps)).toEqual(
        normalizeMaps(previousObjectMaps),
      );
      expect(normalizeMaps(sharedFieldMaps)).toEqual(
        normalizeMaps(previousFieldMaps),
      );

      const report: Record<string, unknown> = {
        workspaceId,
        fieldCount,
        tableCounts,
        poolSize: (typeORMCoreModuleOptions as { poolSize?: number }).poolSize,
      };

      const ITERATIONS = 50;
      const WARMUP = 5;

      for (const scenario of scenarios) {
        for (let warmup = 0; warmup < WARMUP; warmup++) {
          await runPrevious[scenario]();
          await runShared[scenario]();
        }

        const queryCounts: Record<string, number> = {};

        for (const [variantName, run] of [
          ['previous', runPrevious[scenario]],
          ['shared', runShared[scenario]],
        ] as const) {
          const countBefore = logger.queryCount;

          await run();
          queryCounts[variantName] = logger.queryCount - countBefore;
        }

        const durations: Record<string, number[]> = {
          previous: [],
          shared: [],
        };

        for (let iteration = 0; iteration < ITERATIONS; iteration++) {
          // Alternate which variant goes first to cancel drift.
          const order =
            iteration % 2 === 0
              ? (['previous', 'shared'] as const)
              : (['shared', 'previous'] as const);

          for (const variantName of order) {
            const run =
              variantName === 'previous'
                ? runPrevious[scenario]
                : runShared[scenario];
            const startedAt = performance.now();

            await run();
            durations[variantName].push(performance.now() - startedAt);
          }
        }

        report[scenario] = {
          queries: queryCounts,
          previousMs: summarize(durations.previous),
          sharedMs: summarize(durations.shared),
        };
      }

      // eslint-disable-next-line no-console
      console.log(`BENCHMARK_REPORT ${JSON.stringify(report, null, 2)}`);
    } finally {
      await dataSource.destroy();
    }
  });
  },
);
