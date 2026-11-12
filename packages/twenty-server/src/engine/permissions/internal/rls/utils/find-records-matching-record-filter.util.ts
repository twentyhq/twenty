/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const findRecordsMatchingRecordFilter = async <TRecord extends object>({
  records,
  recordFilter,
  flatObjectMetadata,
  metadataMaps,
  findRelationJoinValues,
  shouldIgnoreSoftDeleteDefaultFilter,
}: {
  records: TRecord[];
  recordFilter: RecordGqlOperationFilter;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: PermissionsMetadataMaps;
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
  shouldIgnoreSoftDeleteDefaultFilter?: boolean;
}): Promise<TRecord[]> => {
  const resolvedRecordFilter = await resolveRelationsInRecordFilter({
    recordFilter,
    flatObjectMetadata,
    records,
    metadataMaps,
    findRelationJoinValues,
  });

  return records.filter((record) =>
    isRecordMatchingFilter({
      record,
      filter: resolvedRecordFilter,
      flatObjectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      shouldIgnoreSoftDeleteDefaultFilter,
    }),
  );
};
