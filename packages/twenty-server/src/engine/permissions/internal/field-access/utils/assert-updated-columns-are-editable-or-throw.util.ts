import { type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findUneditableFieldMetadataIdsOnRecord } from 'src/engine/permissions/internal/field-access/utils/find-uneditable-field-metadata-ids-on-record.util';
import { resolveUneditableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/utils/resolve-uneditable-fields-on-matching-records.util';
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
  const uneditableFieldsOnMatchingRecords =
    await resolveUneditableFieldsOnMatchingRecords({
      principals,
      metadataMaps,
      flatObjectMetadata,
      records: formatRecords(
        updates.map(({ rawRecordBefore }) => rawRecordBefore),
      ),
      findRelationJoinValues,
    });

  if (!isNonEmptyArray(uneditableFieldsOnMatchingRecords)) {
    return;
  }

  const columnNameToFieldMetadataId = getColumnNameToFieldMetadataIdMap(
    flatObjectMetadata,
    metadataMaps.flatFieldMetadataMaps,
  );

  for (const { rawRecordBefore, setColumns } of updates) {
    const uneditableFieldMetadataIds = findUneditableFieldMetadataIdsOnRecord({
      flatObjectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      record: formatRecords([rawRecordBefore])[0],
      uneditableFieldsOnMatchingRecords,
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
