import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { type FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';
import { type WorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

type ComputeIndexCreationQueryArgs = {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatIndexMetadata: FlatIndexMetadata;
} & WorkspaceSchemaContextForMigration;
export const computeIndexCreationQuery = async ({
  flatIndexMetadata,
  flatObjectMetadataMaps: _,
  schemaName,
  tableName,
}: ComputeIndexCreationQueryArgs): Promise<string> => {
  // TODO find in cache
  const flatIndexFieldMetadatas = [] as FlatIndexFieldMetadata[];
  // shouldn't we sanitize this ? we can assume it has been validated tho
  const quotedColumns = flatIndexFieldMetadatas.map((column) => `"${column}"`);

  if (flatIndexMetadata.indexType === IndexType.BTREE) {
    return `\nCREATE INDEX IF NOT EXISTS "${flatIndexMetadata.name}" ON "${schemaName}"."${tableName}" USING ${flatIndexMetadata.indexType} (${quotedColumns.join(', ')})\n`;
  }

  const isUnique = flatIndexMetadata.isUnique ? 'UNIQUE' : '';
  const whereClause = flatIndexMetadata.indexWhereClause
    ? `WHERE ${flatIndexMetadata.indexWhereClause}`
    : '';

  return `\nCREATE ${isUnique} INDEX IF NOT EXISTS "${flatIndexMetadata.name}" ON "${schemaName}"."${tableName}" (${quotedColumns.join(', ')}) ${whereClause}\n`;
};
