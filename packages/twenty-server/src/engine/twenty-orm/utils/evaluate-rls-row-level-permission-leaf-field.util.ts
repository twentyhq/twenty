/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import {
  FieldMetadataType,
  type ActorFilter,
  type AddressFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type EmailsFilter,
  type FloatFilter,
  type FullNameFilter,
  type IsFilter,
  type LinksFilter,
  type MultiSelectFilter,
  type PhonesFilter,
  type RatingFilter,
  type RawJsonFilter,
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
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  combineAndResults,
  evaluateCompositeSubFieldMatch,
  evaluateFieldMatchResult,
  hasOnlyAllowedDefinedFilterKeys,
  type RLSPredicateEvaluation,
} from 'src/engine/twenty-orm/utils/evaluate-rls-row-level-permission-predicate-evaluation.util';

export const evaluateRLSRowLevelPermissionLeafField = ({
  record,
  filterKey,
  filterValue,
  objectMetadataField,
}: {
  // oxlint-disable-next-line typescript/no-explicit-any
  record: any;
  filterKey: string;
  filterValue: unknown;
  objectMetadataField: FlatFieldMetadata;
}): RLSPredicateEvaluation => {
  const recordFieldValue = record[filterKey];
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

      if (
        !hasOnlyAllowedDefinedFilterKeys(fullNameFilter, [
          'firstName',
          'lastName',
        ])
      ) {
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

      if (!hasOnlyAllowedDefinedFilterKeys(addressFilter, keys)) {
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

      const keys = [
        'primaryLinkLabel',
        'primaryLinkUrl',
        'secondaryLinks',
      ] as const;

      if (!hasOnlyAllowedDefinedFilterKeys(linksFilter, keys)) {
        return 'invalid';
      }

      return evaluateFieldMatchResult(() =>
        keys.some((key) => {
          const value = linksFilter[key];

          if (value === undefined) {
            return false;
          }

          return evaluateCompositeSubFieldMatch({
            subFieldFilter: value,
            subFieldValue: recordFieldValue[key],
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

      const keys = ['source', 'name', 'workspaceMemberId'] as const;

      if (!hasOnlyAllowedDefinedFilterKeys(actorFilter, keys)) {
        return 'invalid';
      }

      return evaluateFieldMatchResult(() => {
        if (isDefined(actorFilter.source)) {
          return isMatchingSelectFilter({
            selectFilter: actorFilter.source,
            value: recordFieldValue.source,
          });
        }

        if (isDefined(actorFilter.workspaceMemberId)) {
          return isMatchingUUIDFilter({
            uuidFilter: actorFilter.workspaceMemberId,
            value: recordFieldValue.workspaceMemberId,
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

      const keys = ['primaryEmail', 'additionalEmails'] as const;

      if (!hasOnlyAllowedDefinedFilterKeys(emailsFilter, keys)) {
        return 'invalid';
      }

      return evaluateFieldMatchResult(() =>
        keys.some((key) => {
          const value = emailsFilter[key];

          if (value === undefined) {
            return false;
          }

          return evaluateCompositeSubFieldMatch({
            subFieldFilter: value,
            subFieldValue: recordFieldValue[key],
          });
        }),
      );
    }
    case FieldMetadataType.PHONES: {
      const phonesFilter = filterValue as PhonesFilter;

      const keys = [
        'primaryPhoneNumber',
        'primaryPhoneCallingCode',
        'additionalPhones',
      ] as const;

      if (!hasOnlyAllowedDefinedFilterKeys(phonesFilter, keys)) {
        return 'invalid';
      }

      return evaluateFieldMatchResult(() =>
        keys.some((key) => {
          const value = phonesFilter[key];

          if (value === undefined) {
            return false;
          }

          return evaluateCompositeSubFieldMatch({
            subFieldFilter: value,
            subFieldValue: recordFieldValue[key],
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
};

export const evaluateRLSRowLevelPermissionLeafFields = ({
  record,
  filter,
  objectFields,
}: {
  // oxlint-disable-next-line typescript/no-explicit-any
  record: any;
  filter: Record<string, unknown>;
  objectFields: FlatFieldMetadata[];
}): RLSPredicateEvaluation => {
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

      return evaluateRLSRowLevelPermissionLeafField({
        record,
        filterKey,
        filterValue,
        objectMetadataField,
      });
    }),
  );
};
