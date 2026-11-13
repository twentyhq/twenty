import { type QueryRunner } from 'typeorm';

import { type WorkspaceTableColumnSlotUsage } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-column-slot-usage.type';

export const findWorkspaceTableColumnSlotUsages = ({
  queryRunner,
  schemaName,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
}): Promise<WorkspaceTableColumnSlotUsage[]> =>
  queryRunner.query(
    `SELECT c.relname AS "tableName",
            COALESCE(MAX(a.attnum), 0)::int AS "usedColumnSlotCount",
            (COUNT(*) FILTER (WHERE a.attisdropped))::int AS "droppedColumnCount"
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
      WHERE n.nspname = $1
        AND c.relkind = 'r'
      GROUP BY c.relname
      ORDER BY c.relname`,
    [schemaName],
  );
