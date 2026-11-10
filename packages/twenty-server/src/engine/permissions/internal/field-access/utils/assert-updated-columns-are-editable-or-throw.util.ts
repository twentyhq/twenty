import { type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { composeRecordFieldMetadataIds } from 'src/engine/permissions/internal/field-access/utils/compose-record-field-metadata-ids.util';
import { resolveFieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/utils/resolve-fields-hidden-on-matching-records.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const assertUpdatedColumnsAreEditableOrThrow = async ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  updates,
  formatRecords,
  findRelationJoinValues,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  updates: {
    rawRecordBefore: ObjectRecord;
    setColumns: Record<string, unknown>;
  }[];
  formatRecords: (rawRecords: ObjectRecord[]) => ObjectRecord[];
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<void> => {
  const fieldsHiddenOnMatchingRecords =
    await resolveFieldsHiddenOnMatchingRecords({
      principals,
      metadataMaps,
      flatObjectMetadata,
      fieldList: 'uneditableFields',
      records: formatRecords(
        updates.map(({ rawRecordBefore }) => rawRecordBefore),
      ),
      findRelationJoinValues,
    });

  if (!isNonEmptyArray(fieldsHiddenOnMatchingRecords)) {
    return;
  }

  const columnNameToFieldMetadataId = getColumnNameToFieldMetadataIdMap(
    flatObjectMetadata,
    metadataMaps.flatFieldMetadataMaps,
  );

  for (const { rawRecordBefore, setColumns } of updates) {
    const uneditableFieldMetadataIds = composeRecordFieldMetadataIds({
      flatObjectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      objectFieldMetadataIds: [],
      records: formatRecords([rawRecordBefore]),
      fieldsHiddenOnMatchingRecords,
    });

    if (
      Object.keys(setColumns).some((columnName) =>
        uneditableFieldMetadataIds.has(columnNameToFieldMetadataId[columnName]),
      )
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};
