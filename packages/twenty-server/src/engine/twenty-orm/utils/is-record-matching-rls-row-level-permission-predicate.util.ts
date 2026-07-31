/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import {
  type AndObjectRecordFilter,
  type LeafObjectRecordFilter,
  type NotObjectRecordFilter,
  type OrObjectRecordFilter,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { evaluateRLSRowLevelPermissionLeafFields } from 'src/engine/twenty-orm/utils/evaluate-rls-row-level-permission-leaf-field.util';
import {
  combineAndResults,
  combineOrResults,
  type RLSPredicateEvaluation,
} from 'src/engine/twenty-orm/utils/evaluate-rls-row-level-permission-predicate-evaluation.util';

const isLeafFilter = (
  filter: RecordGqlOperationFilter,
): filter is LeafObjectRecordFilter => {
  return !isAndFilter(filter) && !isOrFilter(filter) && !isNotFilter(filter);
};

const isAndFilter = (
  filter: RecordGqlOperationFilter,
): filter is AndObjectRecordFilter => 'and' in filter && !!filter.and;

const isImplicitAndFilter = (filter: RecordGqlOperationFilter) =>
  Object.keys(filter).length > 1;

const isOrFilter = (
  filter: RecordGqlOperationFilter,
): filter is OrObjectRecordFilter => 'or' in filter && !!filter.or;

const isNotFilter = (
  filter: RecordGqlOperationFilter,
): filter is NotObjectRecordFilter => 'not' in filter && !!filter.not;

const isRecordFilterObject = (
  filter: unknown,
): filter is RecordGqlOperationFilter =>
  isObject(filter) && !Array.isArray(filter);

const evaluateRLSRowLevelPermissionPredicate = ({
  record,
  filter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  shouldIgnoreSoftDeleteDefaultFilter,
}: {
  // oxlint-disable-next-line typescript/no-explicit-any
  record: any;
  filter: RecordGqlOperationFilter;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter?: boolean;
}): RLSPredicateEvaluation => {
  if (!isRecordFilterObject(filter)) {
    return 'invalid';
  }

  if (Object.keys(filter).length === 0 && record.deletedAt === null) {
    return true;
  }

  if (isImplicitAndFilter(filter)) {
    return combineAndResults(
      Object.entries(filter).map(([filterKey, value]) =>
        evaluateRLSRowLevelPermissionPredicate({
          record,
          filter: { [filterKey]: value },
          flatObjectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter,
        }),
      ),
    );
  }

  if (isAndFilter(filter)) {
    const filterValue = filter.and;

    if (!Array.isArray(filterValue)) {
      return 'invalid';
    }

    return combineAndResults(
      filterValue.map((andFilter) =>
        evaluateRLSRowLevelPermissionPredicate({
          record,
          filter: andFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter,
        }),
      ),
    );
  }

  if (isOrFilter(filter)) {
    const filterValue = filter.or;

    if (Array.isArray(filterValue)) {
      return combineOrResults(
        filterValue.map((orFilter) =>
          evaluateRLSRowLevelPermissionPredicate({
            record,
            filter: orFilter,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            shouldIgnoreSoftDeleteDefaultFilter,
          }),
        ),
      );
    }

    if (isObject(filterValue)) {
      // The API considers "or" with an object as an "and"
      return evaluateRLSRowLevelPermissionPredicate({
        record,
        filter: filterValue,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      });
    }

    return 'invalid';
  }

  if (isNotFilter(filter)) {
    const filterValue = filter.not;

    if (!isDefined(filterValue) || !isRecordFilterObject(filterValue)) {
      return 'invalid';
    }

    if (isEmptyObject(filterValue)) {
      return true;
    }

    const childResult = evaluateRLSRowLevelPermissionPredicate({
      record,
      filter: filterValue,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      shouldIgnoreSoftDeleteDefaultFilter,
    });

    if (childResult === 'invalid') {
      return 'invalid';
    }

    return childResult === false;
  }

  const shouldTakeDeletedAtIntoAccount =
    shouldIgnoreSoftDeleteDefaultFilter !== true;

  const shouldRejectMatchingBecauseRecordIsSoftDeleted =
    isLeafFilter(filter) &&
    shouldTakeDeletedAtIntoAccount &&
    isDefined(record.deletedAt);

  if (shouldRejectMatchingBecauseRecordIsSoftDeleted) {
    return false;
  }

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return evaluateRLSRowLevelPermissionLeafFields({
    record,
    filter,
    objectFields,
  });
};

export const isRecordMatchingRLSRowLevelPermissionPredicate = ({
  record,
  filter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  shouldIgnoreSoftDeleteDefaultFilter,
}: {
  // oxlint-disable-next-line typescript/no-explicit-any
  record: any;
  filter: RecordGqlOperationFilter;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter?: boolean;
}): boolean => {
  return (
    evaluateRLSRowLevelPermissionPredicate({
      record,
      filter,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      shouldIgnoreSoftDeleteDefaultFilter,
    }) === true
  );
};
