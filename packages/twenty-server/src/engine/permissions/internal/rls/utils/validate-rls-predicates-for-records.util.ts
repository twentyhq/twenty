/* @license Enterprise */

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter.util';

type ValidateRLSPredicatesForRecordsArgs<T extends ObjectLiteral> = {
  records: T[];
  objectMetadata: FlatObjectMetadata;
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
};

export const validateRLSPredicatesForRecords = <T extends ObjectLiteral>({
  records,
  objectMetadata,
  principals,
  metadataMaps,
}: ValidateRLSPredicatesForRecordsArgs<T>): void => {
  const recordFilter = resolveRowLevelPermissionRecordFilter({
    principals,
    metadataMaps,
    flatObjectMetadata: objectMetadata,
  });

  if (!isDefined(recordFilter)) {
    return;
  }

  for (const record of records) {
    const matchesRLS = isRecordMatchingFilter({
      record: record as unknown as ObjectRecord,
      filter: recordFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    });

    if (!matchesRLS) {
      throw new PermissionsException(
        'Record does not satisfy row-level security constraints of your current role',
        PermissionsExceptionCode.RLS_VALIDATION_FAILED,
      );
    }
  }
};
