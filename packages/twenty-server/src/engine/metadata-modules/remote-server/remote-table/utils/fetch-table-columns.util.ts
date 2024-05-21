import { PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

export const fetchTableColumns = async (
  workspaceDataSourceService: WorkspaceDataSourceService,
  workspaceId: string,
  tableName: string,
): Promise<PostgresTableSchemaColumn[]> => {
  const schemaName = workspaceDataSourceService.getSchemaName(workspaceId);

  const res = await workspaceDataSourceService.executeRawQuery(
    `SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2`,
    [schemaName, tableName],
    workspaceId,
  );

  return res.map((column) => ({
    columnName: column.column_name,
    dataType: column.data_type,
    udtName: column.udt_name,
  }));
};
