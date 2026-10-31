/* @license Enterprise */

import { IS_PRIVATE_COLUMN_DEFINITION } from 'src/engine/permissions/private-record/constants/is-private-column-definition.constant';
import { buildPrivateRecordIndexDefinition } from 'src/engine/permissions/private-record/utils/build-private-record-index-definition.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import { type WorkspaceTableSchemaDefinitions } from 'src/engine/permissions/access-group/types/workspace-table-schema-definitions.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const enrichRecordTableSchemaWithIsPrivate = ({
  objectMetadata,
  tableSchema,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'universalIdentifier'>;
  tableSchema: WorkspaceTableSchemaDefinitions;
}): WorkspaceTableSchemaDefinitions => {
  if (isPermissionStorageObject(objectMetadata)) {
    return tableSchema;
  }

  return {
    ...tableSchema,
    columnDefinitions: [
      ...tableSchema.columnDefinitions,
      IS_PRIVATE_COLUMN_DEFINITION,
    ],
    indexDefinitions: [
      ...tableSchema.indexDefinitions,
      buildPrivateRecordIndexDefinition({
        objectMetadataId: objectMetadata.id,
      }),
    ],
  };
};
