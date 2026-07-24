/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import {
  FieldMetadataType,
  type ActorFilter,
  type AddressFilter,
  type AndObjectRecordFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type EmailsFilter,
  type FloatFilter,
  type FullNameFilter,
  type IsFilter,
  type LeafObjectRecordFilter,
  type LinksFilter,
  type MultiSelectFilter,
  type NotObjectRecordFilter,
  type OrObjectRecordFilter,
  type PhonesFilter,
  type RatingFilter,
  type RawJsonFilter,
  type RecordGqlOperationFilter,
  type RichTextFilter,
  type SelectFilter,
  type StringFilter,
  type TSVectorFilter,
  type UUIDFilter,
} from 'twenty-shared/types';
import {
  isDefined,
  isEmptyObject,
  isMatchingArrayFilter,
  isMatchingBooleanFilter,
  isMatchingCurrencyFilter,
  isMatchingDateFilter,
  isMatchingFloatFilter,
  isMatchingMultiSelectFilter,
  isMatchingRatingFilter,
  isMatchingRawJsonFilter,
  isMatchingRichTextFilter,
  isMatchingSelectFilter,
  isMatchingStringFilter,
  isMatchingTSVectorFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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

type RLSPredicateEvaluation = 'invalid' | boolean;

const isRecordFilterObject = (
  filter: unknown,
): filter is RecordGqlOperationFilter =>
  isObject(filter) && !Array.isArray(filter);

const combineAndResults = (
  results: RLSPredicateEvaluation[],
): RLSPredicateEvaluation => {
  if (results.length === 0) {
    return true;
  }

  if (results.some((result) => result === 'invalid')) {
    return 'invalid';
  }

  return results.every((result) => result === true);
};

const combineOrResults = (
  results: RLSPredicateEvaluation[],
): RLSPredicateEvaluation => {
  if (results.length === 0) {
    return true;
  }

  if (results.some((result) => result === 'invalid')) {
    return 'invalid';
  }

  return results.some((result) => result === true);
};

const evaluateFieldMatchResult = (
  evaluation: () => boolean,
): RLSPredicateEvaluation => {
  try {
    return evaluation();
  } catch {
    return 'invalid';
  }
};

const hasDefinedFilterKey = <T extends Record<string, unknown>>(
  filter: T,
  keys: readonly (keyof T)[],
): boolean => keys.some((key) => filter[key] !== undefined);

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

  return combineAndResults(
    Object.entries(filter).map(([filterKey, filterValue]) => {
      if (!isDefined(filterValue)) {
        return 'invalid';
      }

      if (isEmptyObject(filterValue)) {
        return true;
      }

      const objectMetadataField =
        objectFields.find((field) => field.name === filterKey) ??
        objectFields.find(
          (field) =>
            (field.type === FieldMetadataType.RELATION ||
              field.type === FieldMetadataType.MORPH_RELATION) &&
            computeMorphOrRelationFieldJoinColumnName({ name: field.name }) ===
              filterKey,
        );

      if (!isDefined(objectMetadataField)) {
        return 'invalid';
      }

      const recordFieldValue = record[filterKey];

      if (!isDefined(recordFieldValue)) {
        if (isObject(filterValue)) {
          return (filterValue as { is?: IsFilter })?.is === 'NULL';
        }

        return false;
      }

      switch (objectMetadataField.type) {
        case FieldMetadataType.RATING:
          return evaluateFieldMatchResult(() =>
            isMatchingRatingFilter({
              ratingFilter: filterValue as RatingFilter,
              value: recordFieldValue,
            }),
          );
        case FieldMetadataType.TEXT: {
          return evaluateFieldMatchResult(() =>
            isMatchingStringFilter({
              stringFilter: filterValue as StringFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.RICH_TEXT: {
          return evaluateFieldMatchResult(() =>
            isMatchingRichTextFilter({
              richTextFilter: filterValue as RichTextFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.SELECT:
          return evaluateFieldMatchResult(() =>
            isMatchingSelectFilter({
              selectFilter: filterValue as SelectFilter,
              value: recordFieldValue,
            }),
          );
        case FieldMetadataType.MULTI_SELECT:
          return evaluateFieldMatchResult(() =>
            isMatchingMultiSelectFilter({
              multiSelectFilter: filterValue as MultiSelectFilter,
              value: recordFieldValue,
            }),
          );
        case FieldMetadataType.ARRAY: {
          return evaluateFieldMatchResult(() =>
            isMatchingArrayFilter({
              arrayFilter: filterValue as ArrayFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.RAW_JSON: {
          return evaluateFieldMatchResult(() =>
            isMatchingRawJsonFilter({
              rawJsonFilter: filterValue as RawJsonFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.FULL_NAME: {
          const fullNameFilter = filterValue as FullNameFilter;

          if (!hasDefinedFilterKey(fullNameFilter, ['firstName', 'lastName'])) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(
            () =>
              (fullNameFilter.firstName === undefined ||
                isMatchingStringFilter({
                  stringFilter: fullNameFilter.firstName,
                  value: recordFieldValue.firstName,
                })) &&
              (fullNameFilter.lastName === undefined ||
                isMatchingStringFilter({
                  stringFilter: fullNameFilter.lastName,
                  value: recordFieldValue.lastName,
                })),
          );
        }
        case FieldMetadataType.ADDRESS: {
          const addressFilter = filterValue as AddressFilter;

          const keys = [
            'addressStreet1',
            'addressStreet2',
            'addressCity',
            'addressState',
            'addressCountry',
            'addressPostcode',
          ] as const;

          if (!hasDefinedFilterKey(addressFilter, keys)) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(() =>
            keys.some((key) => {
              const value = addressFilter[key];

              if (value === undefined) {
                return false;
              }

              return isMatchingStringFilter({
                stringFilter: value,
                value: recordFieldValue[key],
              });
            }),
          );
        }
        case FieldMetadataType.LINKS: {
          const linksFilter = filterValue as LinksFilter;

          const keys = ['primaryLinkLabel', 'primaryLinkUrl'] as const;

          if (!hasDefinedFilterKey(linksFilter, keys)) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(() =>
            keys.some((key) => {
              const value = linksFilter[key];

              if (value === undefined) {
                return false;
              }

              return isMatchingStringFilter({
                stringFilter: value,
                value: recordFieldValue[key],
              });
            }),
          );
        }
        case FieldMetadataType.DATE:
        case FieldMetadataType.DATE_TIME: {
          return evaluateFieldMatchResult(() =>
            isMatchingDateFilter({
              dateFilter: filterValue as DateFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.NUMBER:
        case FieldMetadataType.NUMERIC: {
          return evaluateFieldMatchResult(() =>
            isMatchingFloatFilter({
              floatFilter: filterValue as FloatFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.UUID: {
          return evaluateFieldMatchResult(() =>
            isMatchingUUIDFilter({
              uuidFilter: filterValue as UUIDFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.BOOLEAN: {
          return evaluateFieldMatchResult(() =>
            isMatchingBooleanFilter({
              booleanFilter: filterValue as BooleanFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.CURRENCY: {
          return evaluateFieldMatchResult(() =>
            isMatchingCurrencyFilter({
              currencyFilter: filterValue as CurrencyFilter,
              value: recordFieldValue,
            }),
          );
        }
        case FieldMetadataType.ACTOR: {
          const actorFilter = filterValue as ActorFilter;

          if (!hasDefinedFilterKey(actorFilter, ['source', 'name'])) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(() => {
            if (isDefined(actorFilter.source)) {
              return isMatchingSelectFilter({
                selectFilter: actorFilter.source,
                value: recordFieldValue.source,
              });
            }

            return (
              actorFilter.name === undefined ||
              isMatchingStringFilter({
                stringFilter: actorFilter.name,
                value: recordFieldValue.name,
              })
            );
          });
        }
        case FieldMetadataType.EMAILS: {
          const emailsFilter = filterValue as EmailsFilter;

          if (!hasDefinedFilterKey(emailsFilter, ['primaryEmail'])) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(() =>
            isMatchingStringFilter({
              stringFilter: emailsFilter.primaryEmail as StringFilter,
              value: recordFieldValue.primaryEmail,
            }),
          );
        }
        case FieldMetadataType.PHONES: {
          const phonesFilter = filterValue as PhonesFilter;

          const keys: (keyof PhonesFilter)[] = ['primaryPhoneNumber'];

          if (!hasDefinedFilterKey(phonesFilter, keys)) {
            return 'invalid';
          }

          return evaluateFieldMatchResult(() =>
            keys.some((key) => {
              const value = phonesFilter[key];

              if (value === undefined) {
                return false;
              }

              return isMatchingStringFilter({
                stringFilter: value,
                value: recordFieldValue[key],
              });
            }),
          );
        }
        case FieldMetadataType.RELATION:
        case FieldMetadataType.MORPH_RELATION: {
          const isJoinColumn =
            computeMorphOrRelationFieldJoinColumnName({
              name: objectMetadataField.name,
            }) === filterKey;

          return evaluateFieldMatchResult(() => {
            if (isJoinColumn) {
              return isMatchingUUIDFilter({
                uuidFilter: filterValue as UUIDFilter,
                value: recordFieldValue,
              });
            }

            return isMatchingUUIDFilter({
              uuidFilter: filterValue as UUIDFilter,
              value: recordFieldValue?.id ?? null,
            });
          });
        }
        case FieldMetadataType.TS_VECTOR: {
          return evaluateFieldMatchResult(() =>
            isMatchingTSVectorFilter({
              tsVectorFilter: filterValue as TSVectorFilter,
              value: recordFieldValue,
            }),
          );
        }
        default: {
          return 'invalid';
        }
      }
    }),
  );
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
