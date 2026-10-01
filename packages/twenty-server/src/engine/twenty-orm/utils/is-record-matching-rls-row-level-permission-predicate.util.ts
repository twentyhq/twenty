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

// Sub-fields are ANDed as in SQL; one this matcher cannot read never matches
const hasOnlyReadableSubFields = (
  compositeFilter: object,
  readableSubFieldNames: string[],
): boolean =>
  Object.entries(compositeFilter).every(
    ([subFieldName, subFieldFilter]) =>
      !isDefined(subFieldFilter) ||
      readableSubFieldNames.includes(subFieldName),
  );

const isMatchingOptionalStringFilter = (
  stringFilter: StringFilter | null | undefined,
  value: string,
): boolean =>
  !isDefined(stringFilter) || isMatchingStringFilter({ stringFilter, value });

// A null JSON column matches nothing in SQL but an IS NULL check, while its
// serialized form would match patterns like '%null%' in memory
const isMatchingOptionalRawJsonFilter = (
  rawJsonFilter: RawJsonFilter | null | undefined,
  value: string | null | undefined,
): boolean => {
  if (!isDefined(rawJsonFilter)) {
    return true;
  }

  if (!isDefined(value)) {
    return rawJsonFilter.is === 'NULL';
  }

  return isMatchingRawJsonFilter({ rawJsonFilter, value });
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
      case FieldMetadataType.FULL_NAME: {
        const fullNameFilter = filterValue as FullNameFilter;

        return (
          (fullNameFilter.firstName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.firstName,
              value: recordFieldValue.firstName,
            })) &&
          (fullNameFilter.lastName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.lastName,
              value: recordFieldValue.lastName,
            }))
        );
      }
      case FieldMetadataType.ADDRESS: {
        const addressFilter = filterValue as AddressFilter;
        const addressSubFieldNames = [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressState',
          'addressCountry',
          'addressPostcode',
        ] as const;

        return (
          hasOnlyReadableSubFields(addressFilter, [...addressSubFieldNames]) &&
          addressSubFieldNames.every((subFieldName) =>
            isMatchingOptionalStringFilter(
              addressFilter[subFieldName],
              recordFieldValue?.[subFieldName],
            ),
          )
        );
      }
      case FieldMetadataType.LINKS: {
        const linksFilter = filterValue as LinksFilter;

        return (
          hasOnlyReadableSubFields(linksFilter, [
            'primaryLinkLabel',
            'primaryLinkUrl',
            'secondaryLinks',
          ]) &&
          isMatchingOptionalStringFilter(
            linksFilter.primaryLinkLabel,
            recordFieldValue?.primaryLinkLabel,
          ) &&
          isMatchingOptionalStringFilter(
            linksFilter.primaryLinkUrl,
            recordFieldValue?.primaryLinkUrl,
          ) &&
          isMatchingOptionalRawJsonFilter(
            linksFilter.secondaryLinks,
            recordFieldValue?.secondaryLinks,
          )
        );
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
      case FieldMetadataType.ACTOR: {
        const actorFilter = filterValue as ActorFilter;

        return (
          hasOnlyReadableSubFields(actorFilter, [
            'source',
            'name',
            'workspaceMemberId',
          ]) &&
          (!isDefined(actorFilter.source) ||
            isMatchingSelectFilter({
              selectFilter: actorFilter.source,
              value: recordFieldValue?.source ?? null,
            })) &&
          isMatchingOptionalStringFilter(
            actorFilter.name,
            recordFieldValue?.name,
          ) &&
          (!isDefined(actorFilter.workspaceMemberId) ||
            isMatchingUUIDFilter({
              uuidFilter: actorFilter.workspaceMemberId,
              value: recordFieldValue?.workspaceMemberId ?? null,
            }))
        );
      }
      case FieldMetadataType.EMAILS: {
        const emailsFilter = filterValue as EmailsFilter;

        return (
          hasOnlyReadableSubFields(emailsFilter, [
            'primaryEmail',
            'additionalEmails',
          ]) &&
          isMatchingOptionalStringFilter(
            emailsFilter.primaryEmail,
            recordFieldValue?.primaryEmail,
          ) &&
          isMatchingOptionalRawJsonFilter(
            emailsFilter.additionalEmails,
            recordFieldValue?.additionalEmails,
          )
        );
      }
      case FieldMetadataType.PHONES: {
        // Row-level predicates can target the country code, which PhonesFilter omits
        const phonesFilter = filterValue as PhonesFilter & {
          primaryPhoneCountryCode?: StringFilter;
        };
        const phonesStringSubFieldNames = [
          'primaryPhoneNumber',
          'primaryPhoneCountryCode',
          'primaryPhoneCallingCode',
        ] as const;

        return (
          hasOnlyReadableSubFields(phonesFilter, [
            ...phonesStringSubFieldNames,
            'additionalPhones',
          ]) &&
          phonesStringSubFieldNames.every((subFieldName) =>
            isMatchingOptionalStringFilter(
              phonesFilter[subFieldName],
              recordFieldValue?.[subFieldName],
            ),
          ) &&
          isMatchingOptionalRawJsonFilter(
            phonesFilter.additionalPhones,
            recordFieldValue?.additionalPhones,
          )
        );
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
          value: recordFieldValue?.id ?? null,
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
