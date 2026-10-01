/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import {
  FieldMetadataType,
  type AndObjectRecordFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type FloatFilter,
  type IsFilter,
  type LeafObjectRecordFilter,
  type MultiSelectFilter,
  type NotObjectRecordFilter,
  type OrObjectRecordFilter,
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
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
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

type SubFieldMatcher = (subFieldFilter: object, value: unknown) => boolean;

const matchString: SubFieldMatcher = (subFieldFilter, value) =>
  isMatchingStringFilter({
    stringFilter: subFieldFilter as StringFilter,
    value: value as string,
  });

const matchRawJson: SubFieldMatcher = (subFieldFilter, value) =>
  isMatchingRawJsonFilter({
    rawJsonFilter: subFieldFilter as RawJsonFilter,
    value: value as string,
  });

const matchFloat: SubFieldMatcher = (subFieldFilter, value) =>
  isMatchingFloatFilter({
    floatFilter: subFieldFilter as FloatFilter,
    value: value as number,
  });

const matchSelect: SubFieldMatcher = (subFieldFilter, value) =>
  isMatchingSelectFilter({
    selectFilter: subFieldFilter as SelectFilter,
    value: value as string,
  });

const matchUuid: SubFieldMatcher = (subFieldFilter, value) =>
  isMatchingUUIDFilter({
    uuidFilter: subFieldFilter as UUIDFilter,
    value: value as string,
  });

// Row-level predicates can target sub-fields the GraphQL filter types omit,
// such as address coordinates, the actor context or the phone country code
const SUB_FIELD_MATCHERS_BY_COMPOSITE_TYPE: Partial<
  Record<FieldMetadataType, Record<string, SubFieldMatcher>>
> = {
  [FieldMetadataType.FULL_NAME]: {
    firstName: matchString,
    lastName: matchString,
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: matchString,
    addressStreet2: matchString,
    addressCity: matchString,
    addressState: matchString,
    addressCountry: matchString,
    addressPostcode: matchString,
    addressLat: matchFloat,
    addressLng: matchFloat,
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: matchString,
    primaryLinkUrl: matchString,
    secondaryLinks: matchRawJson,
  },
  [FieldMetadataType.ACTOR]: {
    source: matchSelect,
    name: matchString,
    workspaceMemberId: matchUuid,
    context: matchRawJson,
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: matchString,
    additionalEmails: matchRawJson,
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: matchString,
    primaryPhoneCountryCode: matchString,
    primaryPhoneCallingCode: matchString,
    additionalPhones: matchRawJson,
  },
};

// Sub-fields are ANDed as in SQL. An absent or empty sub-field filter is no
// constraint, one this matcher cannot read never matches, and a null
// sub-field, of a null composite too, only matches IS NULL
const isMatchingCompositeFilter = ({
  compositeFilter,
  compositeValue,
  subFieldMatchers,
}: {
  compositeFilter: Record<string, { is?: IsFilter } | null | undefined>;
  compositeValue: Record<string, unknown> | null | undefined;
  subFieldMatchers: Record<string, SubFieldMatcher>;
}): boolean =>
  Object.entries(compositeFilter).every(([subFieldName, subFieldFilter]) => {
    if (
      !isDefined(subFieldFilter) ||
      Object.keys(subFieldFilter).length === 0
    ) {
      return true;
    }

    const isMatching = subFieldMatchers[subFieldName];

    if (!isDefined(isMatching)) {
      return false;
    }

    const value = compositeValue?.[subFieldName];

    if (!isDefined(value)) {
      return subFieldFilter.is === 'NULL';
    }

    return isMatching(subFieldFilter, value);
  });

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
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter?: boolean;
}): boolean => {
  if (Object.keys(filter).length === 0 && record.deletedAt === null) {
    return true;
  }

  if (isImplicitAndFilter(filter)) {
    return Object.entries(filter).every(([filterKey, value]) =>
      isRecordMatchingRLSRowLevelPermissionPredicate({
        record,
        filter: { [filterKey]: value },
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      }),
    );
  }

  if (isAndFilter(filter)) {
    const filterValue = filter.and;

    if (!Array.isArray(filterValue)) {
      throw new Error(
        'Unexpected value for "and" filter : ' + JSON.stringify(filterValue),
      );
    }

    return (
      filterValue.length === 0 ||
      filterValue.every((andFilter) =>
        isRecordMatchingRLSRowLevelPermissionPredicate({
          record,
          filter: andFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter,
        }),
      )
    );
  }

  if (isOrFilter(filter)) {
    const filterValue = filter.or;

    if (Array.isArray(filterValue)) {
      return (
        filterValue.length === 0 ||
        filterValue.some((orFilter) =>
          isRecordMatchingRLSRowLevelPermissionPredicate({
            record,
            filter: orFilter,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            shouldIgnoreSoftDeleteDefaultFilter,
          }),
        )
      );
    }

    if (isObject(filterValue)) {
      // The API considers "or" with an object as an "and"
      return isRecordMatchingRLSRowLevelPermissionPredicate({
        record,
        filter: filterValue,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      });
    }

    throw new Error('Unexpected value for "or" filter : ' + filterValue);
  }

  if (isNotFilter(filter)) {
    const filterValue = filter.not;

    if (!isDefined(filterValue)) {
      throw new Error('Unexpected value for "not" filter : ' + filterValue);
    }

    return (
      isEmptyObject(filterValue) ||
      !isRecordMatchingRLSRowLevelPermissionPredicate({
        record,
        filter: filterValue,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter,
      })
    );
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

  return Object.entries(filter).every(([filterKey, filterValue]) => {
    if (!isDefined(filterValue)) {
      throw new Error(
        'Unexpected value for filter key "' + filterKey + '" : ' + filterValue,
      );
    }

    if (isEmptyObject(filterValue)) return true;

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
      throw new Error(
        'Field metadata item "' +
          filterKey +
          '" not found for object metadata item ' +
          flatObjectMetadata.nameSingular,
      );
    }

    const subFieldMatchers =
      SUB_FIELD_MATCHERS_BY_COMPOSITE_TYPE[objectMetadataField.type];

    if (isDefined(subFieldMatchers)) {
      return isMatchingCompositeFilter({
        compositeFilter: filterValue as Record<string, { is?: IsFilter }>,
        compositeValue: record[filterKey],
        subFieldMatchers,
      });
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
        return isMatchingRatingFilter({
          ratingFilter: filterValue as RatingFilter,
          value: recordFieldValue,
          options: objectMetadataField.options,
        });
      case FieldMetadataType.TEXT: {
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.RICH_TEXT: {
        return isMatchingRichTextFilter({
          richTextFilter: filterValue as RichTextFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.SELECT:
        return isMatchingSelectFilter({
          selectFilter: filterValue as SelectFilter,
          value: recordFieldValue,
          options: objectMetadataField.options,
        });
      case FieldMetadataType.MULTI_SELECT:
        return isMatchingMultiSelectFilter({
          multiSelectFilter: filterValue as MultiSelectFilter,
          value: recordFieldValue,
        });
      case FieldMetadataType.ARRAY: {
        return isMatchingArrayFilter({
          arrayFilter: filterValue as ArrayFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.RAW_JSON: {
        return isMatchingRawJsonFilter({
          rawJsonFilter: filterValue as RawJsonFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME: {
        return isMatchingDateFilter({
          dateFilter: filterValue as DateFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC: {
        return isMatchingFloatFilter({
          floatFilter: filterValue as FloatFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.UUID: {
        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.BOOLEAN: {
        return isMatchingBooleanFilter({
          booleanFilter: filterValue as BooleanFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.CURRENCY: {
        return isMatchingCurrencyFilter({
          currencyFilter: filterValue as CurrencyFilter,
          value: recordFieldValue,
        });
      }
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION: {
        const isJoinColumn =
          computeMorphOrRelationFieldJoinColumnName({
            name: objectMetadataField.name,
          }) === filterKey;

        if (isJoinColumn) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue as UUIDFilter,
            value: recordFieldValue,
          });
        }

        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: recordFieldValue.id ?? null,
        });
      }
      case FieldMetadataType.TS_VECTOR: {
        return isMatchingTSVectorFilter({
          tsVectorFilter: filterValue as TSVectorFilter,
          value: recordFieldValue,
        });
      }
      default: {
        throw new Error(
          `Not implemented yet for field type "${objectMetadataField.type}"`,
        );
      }
    }
  });
};
