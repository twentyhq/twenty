/* @license Enterprise */

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/internal/private-record/constants/created-by-workspace-member-id-column-name.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { hasCreatedByField } from 'src/engine/permissions/internal/private-record/utils/has-created-by-field.util';
import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildFindPrivateRecordStatesQuery = <
  TFlatFieldMetadata extends OrmFlatFieldMetadata,
>({
  tableExpression,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  recordIds,
}: {
  tableExpression: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<TFlatFieldMetadata>;
  recordIds: string[];
}): RecordPermissionQuery => {
  const createdBy = hasCreatedByField({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })
    ? escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)
    : 'NULL';

  return {
    sql: `SELECT "id", ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AS "isPrivate", ${createdBy} AS "createdByWorkspaceMemberId" FROM ${tableExpression} WHERE "id" = ANY(:recordIds)`,
    parameters: { recordIds },
  };
};
