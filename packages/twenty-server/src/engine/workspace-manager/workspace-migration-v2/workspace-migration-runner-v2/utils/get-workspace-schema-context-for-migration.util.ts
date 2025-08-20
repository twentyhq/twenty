import {
  type FlatObjectMetadata,
  type FlatObjectMetadataWithoutFields,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

export type WorkspaceSchemaContextForMigration = {
  schemaName: string;
  tableName: string;
};

export const getWorkspaceSchemaContextForMigration = ({
  workspaceId,
  flatObjectMetadata,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata | FlatObjectMetadataWithoutFields;
}): WorkspaceSchemaContextForMigration => {
  return {
    schemaName: getWorkspaceSchemaName(workspaceId),
    tableName: computeObjectTargetTable(flatObjectMetadata),
  };
};
