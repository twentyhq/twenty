/* @license Enterprise */

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/permissions/rls/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util';

type ValidateRLSPredicatesForRecordsArgs<T extends ObjectLiteral> = {
  records: T[];
  objectMetadata: FlatObjectMetadata;
  principal: PermissionsPrincipal;
  metadataMaps: PermissionsMetadataMaps;
};

export const validateRLSPredicatesForRecords = <T extends ObjectLiteral>({
  records,
  objectMetadata,
  principal,
  metadataMaps,
}: ValidateRLSPredicatesForRecordsArgs<T>): void => {
  const recordFilter = resolveRowLevelPermissionRecordFilter({
    principal,
    metadataMaps,
    flatObjectMetadata: objectMetadata,
  });

  if (!isDefined(recordFilter)) {
    return;
  }

  for (const record of records) {
    const matchesRLS = isRecordMatchingRLSRowLevelPermissionPredicate({
      record: record as unknown as ObjectRecord,
      filter: recordFilter,
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    });

    if (!matchesRLS) {
      throw new TwentyOrmException(
        'Record does not satisfy row-level security constraints of your current role',
        TwentyOrmExceptionCode.RLS_VALIDATION_FAILED,
      );
    }
  }
};
