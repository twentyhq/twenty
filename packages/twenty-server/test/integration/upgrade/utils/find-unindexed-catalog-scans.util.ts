import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type EntityManager } from 'typeorm';

// Catalogs that hold rows for every table of every workspace schema.
const TENANT_SCALED_CATALOG_RELATIONS = new Set([
  'pg_attrdef',
  'pg_attribute',
  'pg_class',
  'pg_constraint',
  'pg_depend',
  'pg_index',
  'pg_statistic',
  'pg_trigger',
  'pg_type',
]);

const CATALOG_READ_REGEX =
  /^\s*(SELECT|WITH)\b[\s\S]*(\binformation_schema\s*\.|\bpg_(attrdef|attribute|class|constraint|depend|index|statistic|stats|trigger|type)\b)/i;

type PlanNode = {
  'Node Type': string;
  'Relation Name'?: string;
  'Index Name'?: string;
  'Index Cond'?: string;
  Plans?: PlanNode[];
};

type IndexShape = { tableName: string; leadingColumnName: string };

export type CapturedQuery = { query: string; parameters?: unknown[] };

export type UnindexedCatalogScan = { query: string; relations: string[] };

const flattenPlan = (node: PlanNode): PlanNode[] => [
  node,
  ...(node.Plans ?? []).flatMap(flattenPlan),
];

const findIndexShape = async (
  manager: EntityManager,
  indexName: string,
): Promise<IndexShape | undefined> => {
  const [indexShape]: IndexShape[] = await manager.query(
    `SELECT c.relname AS "tableName", a.attname AS "leadingColumnName"
     FROM pg_index i
     JOIN pg_class c ON c.oid = i.indrelid
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = i.indkey[0]
     WHERE i.indexrelid = to_regclass($1)`,
    [indexName],
  );

  return indexShape;
};

// An index condition on a later column only (relnamespace on pg_class's
// (relname, relnamespace) index) still reads the whole index.
const findUnindexedTenantScans = async (
  manager: EntityManager,
  plan: PlanNode,
): Promise<string[]> => {
  const relations: string[] = [];

  for (const node of flattenPlan(plan)) {
    const relationName = node['Relation Name'];
    const indexName = node['Index Name'];

    if (
      node['Node Type'] === 'Seq Scan' &&
      isDefined(relationName) &&
      TENANT_SCALED_CATALOG_RELATIONS.has(relationName)
    ) {
      relations.push(relationName);
      continue;
    }

    if (!isDefined(indexName)) {
      continue;
    }

    const indexShape = await findIndexShape(manager, indexName);

    if (
      isDefined(indexShape) &&
      TENANT_SCALED_CATALOG_RELATIONS.has(indexShape.tableName) &&
      !(node['Index Cond'] ?? '').includes(
        `(${indexShape.leadingColumnName} = `,
      )
    ) {
      relations.push(`${indexShape.tableName} (${indexName})`);
    }
  }

  return relations;
};

// With seq scans disabled, the planner falls back to a full scan only when no index
// can narrow the read: that scan grows with the number of workspaces.
export const findUnindexedCatalogScans = async ({
  dataSource,
  capturedQueries,
}: {
  dataSource: DataSource;
  capturedQueries: CapturedQuery[];
}): Promise<UnindexedCatalogScan[]> => {
  const unindexedScans: UnindexedCatalogScan[] = [];

  for (const { query, parameters } of capturedQueries) {
    if (!CATALOG_READ_REGEX.test(query)) {
      continue;
    }

    const relations = await dataSource.transaction(async (manager) => {
      await manager.query('SET LOCAL enable_seqscan = off');

      const [explainRow]: { 'QUERY PLAN': { Plan: PlanNode }[] }[] =
        await manager.query(`EXPLAIN (FORMAT JSON) ${query}`, parameters);

      return findUnindexedTenantScans(
        manager,
        explainRow['QUERY PLAN'][0].Plan,
      );
    });

    if (relations.length > 0) {
      unindexedScans.push({ query, relations: [...new Set(relations)] });
    }
  }

  return unindexedScans;
};
