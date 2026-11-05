/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/created-by-workspace-member-id-column-name.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const findPrivateRecordStates = async <
  TFlatFieldMetadata extends OrmFlatFieldMetadata,
>({
  repository,
  tableExpression,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  recordIds,
}: {
  repository: Pick<WorkspaceRepository, 'executeRaw'>;
  tableExpression: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<TFlatFieldMetadata>;
  recordIds: string[];
}): Promise<Map<string, PrivateRecordState>> => {
  if (!isNonEmptyArray(recordIds)) {
    return new Map();
  }

  const createdBy = hasCreatedByField({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })
    ? escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)
    : 'NULL';

  const rows = await repository.executeRaw<{ id: string } & PrivateRecordState>(
    `SELECT "id", ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AS "isPrivate", ${createdBy} AS "createdByWorkspaceMemberId" FROM ${tableExpression} WHERE "id" = ANY(:recordIds)`,
    { recordIds },
  );

  return new Map(
    rows.map(({ id, isPrivate, createdByWorkspaceMemberId }) => [
      id,
      { isPrivate, createdByWorkspaceMemberId },
    ]),
  );
};
