/* @license Enterprise */

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findRecordsMatchingRecordFilter } from 'src/engine/permissions/internal/rls/utils/find-records-matching-record-filter.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

export const validateRlsPredicatesForRecords = async <T extends ObjectRecord>({
  records,
  objectMetadata,
  principals,
  metadataMaps,
  findRelationJoinValues,
}: {
  records: T[];
  objectMetadata: FlatObjectMetadata;
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<void> => {
  const recordFilter = resolveRlsRuleRecordFilter({
    principals,
    metadataMaps,
    flatObjectMetadata: objectMetadata,
    operationType: 'create',
  });

  if (!isDefined(recordFilter)) {
    return;
  }

  const matchingRecords = await findRecordsMatchingRecordFilter({
    records,
    recordFilter,
    flatObjectMetadata: objectMetadata,
    metadataMaps,
    findRelationJoinValues,
  });

  if (matchingRecords.length !== records.length) {
    throw new PermissionsException(
      'Record does not satisfy row-level security constraints of your current role',
      PermissionsExceptionCode.RLS_VALIDATION_FAILED,
    );
  }
};
