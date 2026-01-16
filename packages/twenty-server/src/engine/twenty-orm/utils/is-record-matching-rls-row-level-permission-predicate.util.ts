/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ActorFilter,
  type AddressFilter,
  type AndObjectRecordFilter,
  type ArrayFilter,
  type BooleanFilter,
  type DateFilter,
  type EmailsFilter,
  type FloatFilter,
  type FullNameFilter,
  type LeafObjectRecordFilter,
  type LinksFilter,
  type MultiSelectFilter,
  type NotObjectRecordFilter,
  type ObjectRecord,
  type OrObjectRecordFilter,
  type PhonesFilter,
  type RatingFilter,
  type RawJsonFilter,
  type RecordGqlOperationFilter,
  type RichTextV2Filter,
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
  isMatchingRichTextV2Filter,
  isMatchingSelectFilter,
  isMatchingStringFilter,
  isMatchingTSVectorFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

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

const getCompositeRecordSubFieldValue = ({
  record,
  filterKey,
  subFieldName,
}: {
  record: Record<string, unknown>;
  filterKey: string;
  subFieldName: string;
}): string | undefined => {
  const compositeValue = record[filterKey];

  if (isObject(compositeValue)) {
    return (compositeValue as Record<string, unknown>)[subFieldName] as
      | string
      | undefined;
  }

  const flattenedKey = `${filterKey}${subFieldName.charAt(0).toUpperCase()}${subFieldName.slice(1)}`;

  if (Object.prototype.hasOwnProperty.call(record, flattenedKey)) {
    return record[flattenedKey] as string | undefined;
  }

  return undefined;
};

const isCompositeStringFilterMatching = ({
  record,
  filterKey,
  subFieldName,
  stringFilter,
}: {
  record: Record<string, unknown>;
  filterKey: string;
  subFieldName: string;
  stringFilter: StringFilter;
}) =>
  isMatchingStringFilter({
    stringFilter,
    value: getCompositeRecordSubFieldValue({
      record,
      filterKey,
      subFieldName,
    }) as string,
  });

const getCompositeStringFilterKeys = ({
  compositeFieldType,
  filterValue,
}: {
  compositeFieldType: FieldMetadataType;
  filterValue: Record<string, StringFilter | undefined>;
}) => {
  const compositeType = compositeTypeDefinitions.get(compositeFieldType);

  if (!compositeType) {
    return [];
  }

  return compositeType.properties
    .filter((property) => property.type === FieldMetadataType.TEXT)
    .map((property) => property.name)
    .filter((propertyName) =>
      Object.prototype.hasOwnProperty.call(filterValue, propertyName),
    );
};

const matchCompositeStringFilters = ({
  record,
  filterKey,
  filterValue,
  compositeFieldType,
  mode,
  requireAtLeastOne,
}: {
  record: Record<string, unknown>;
  filterKey: string;
  filterValue: Record<string, StringFilter | undefined>;
  compositeFieldType: FieldMetadataType;
  mode: 'every' | 'some';
  requireAtLeastOne: boolean;
}) => {
  const keys = getCompositeStringFilterKeys({
    compositeFieldType,
    filterValue,
  });

  if (keys.length === 0) {
    return !requireAtLeastOne;
  }

  const matchPredicate = (subFieldName: string) => {
    const subFieldFilter = filterValue[subFieldName];

    if (subFieldFilter === undefined) {
      return mode === 'every';
    }

    return isCompositeStringFilterMatching({
      record,
      filterKey,
      subFieldName,
      stringFilter: subFieldFilter,
    });
  };

  return mode === 'every'
    ? keys.every(matchPredicate)
    : keys.some(matchPredicate);
};

export const isRecordMatchingRLSRowLevelPermissionPredicate = ({
  record,
  filter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  record: ObjectRecord;
  filter: ObjectRecordFilter;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
      })
    );
  }

  if (isLeafFilter(filter)) {
    if (isDefined(record.deletedAt) && filter.deletedAt === undefined) {
      return false;
    }
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
          field.type === FieldMetadataType.RELATION &&
          (field.settings as { joinColumnName?: string } | undefined)
            ?.joinColumnName === filterKey,
      );

    if (!isDefined(objectMetadataField)) {
      throw new Error(
        'Field metadata item "' +
          filterKey +
          '" not found for object metadata item ' +
          flatObjectMetadata.nameSingular,
      );
    }

    switch (objectMetadataField.type) {
      case FieldMetadataType.RATING:
        return isMatchingRatingFilter({
          ratingFilter: filterValue as RatingFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.TEXT: {
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RICH_TEXT: {
        // TODO: Implement a better rich text filter once it becomes a composite field
        // See this issue for more context: https://github.com/twentyhq/twenty/issues/7613#issuecomment-2408944585
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RICH_TEXT_V2: {
        return isMatchingRichTextV2Filter({
          richTextV2Filter: filterValue as RichTextV2Filter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.SELECT:
        return isMatchingSelectFilter({
          selectFilter: filterValue as SelectFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.MULTI_SELECT:
        return isMatchingMultiSelectFilter({
          multiSelectFilter: filterValue as MultiSelectFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.ARRAY: {
        return isMatchingArrayFilter({
          arrayFilter: filterValue as ArrayFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RAW_JSON: {
        return isMatchingRawJsonFilter({
          rawJsonFilter: filterValue as RawJsonFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.FULL_NAME: {
        const fullNameFilter = filterValue as FullNameFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: fullNameFilter,
          compositeFieldType: FieldMetadataType.FULL_NAME,
          mode: 'every',
          requireAtLeastOne: false,
        });
      }
      case FieldMetadataType.ADDRESS: {
        const addressFilter = filterValue as AddressFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: addressFilter,
          compositeFieldType: FieldMetadataType.ADDRESS,
          mode: 'some',
          requireAtLeastOne: true,
        });
      }
      case FieldMetadataType.LINKS: {
        const linksFilter = filterValue as LinksFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: linksFilter,
          compositeFieldType: FieldMetadataType.LINKS,
          mode: 'some',
          requireAtLeastOne: true,
        });
      }
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME: {
        return isMatchingDateFilter({
          dateFilter: filterValue as DateFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC: {
        return isMatchingFloatFilter({
          floatFilter: filterValue as FloatFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.UUID: {
        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.BOOLEAN: {
        return isMatchingBooleanFilter({
          booleanFilter: filterValue as BooleanFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.CURRENCY: {
        return isMatchingCurrencyFilter({
          currencyFilter: filterValue,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.ACTOR: {
        const actorFilter = filterValue as ActorFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: actorFilter,
          compositeFieldType: FieldMetadataType.ACTOR,
          mode: 'every',
          requireAtLeastOne: false,
        });
      }
      case FieldMetadataType.EMAILS: {
        const emailsFilter = filterValue as EmailsFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: emailsFilter,
          compositeFieldType: FieldMetadataType.EMAILS,
          mode: 'every',
          requireAtLeastOne: true,
        });
      }
      case FieldMetadataType.PHONES: {
        const phonesFilter = filterValue as PhonesFilter;

        return matchCompositeStringFilters({
          record,
          filterKey,
          filterValue: phonesFilter,
          compositeFieldType: FieldMetadataType.PHONES,
          mode: 'some',
          requireAtLeastOne: true,
        });
      }
      case FieldMetadataType.RELATION: {
        const isJoinColumn =
          (
            objectMetadataField.settings as
              | { joinColumnName?: string }
              | undefined
          )?.joinColumnName === filterKey;

        if (isJoinColumn) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue as UUIDFilter,
            value: record[filterKey],
          });
        }

        throw new Error(
          `Not implemented yet, use UUID filter instead on the corresponding "${filterKey}Id" field`,
        );
      }
      case FieldMetadataType.TS_VECTOR: {
        return isMatchingTSVectorFilter({
          tsVectorFilter: filterValue as TSVectorFilter,
          value: record[filterKey],
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
