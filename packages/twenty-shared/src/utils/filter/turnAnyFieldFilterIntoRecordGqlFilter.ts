import { CURRENCY_CODE_LABELS } from '@/constants';
import { type CurrencyCode } from '@/constants/CurrencyCode';
import { FieldMetadataType, ViewFilterOperand, type PartialFieldMetadataItem, type RecordGqlOperationFilter } from '@/types';
import { filterSelectOptionsOfFieldMetadataItem, type RecordFilter } from '@/utils';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { turnRecordFilterIntoRecordGqlOperationFilter } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';
import { createAnyFieldRecordFilterBaseProperties } from '@/utils/filter/utils/createAnyFieldRecordFilterBaseProperties';
import { isDefined } from '@/utils/validation';
import { isNonEmptyString } from '@sniptt/guards';

import { z } from 'zod';

const currencies: { value: CurrencyCode; label: string }[] = Object.entries(
  CURRENCY_CODE_LABELS,
).map(([key, { label }]) => ({
  value: key as CurrencyCode,
  label: `${label} (${key})`,
}));

export const turnAnyFieldFilterIntoRecordGqlFilter = ({
  filterValue,
  fields,
}: {
  filterValue: string;
  fields: PartialFieldMetadataItem[];
}) => {

  const anyFieldRecordFilters: RecordFilter[] = [];

  const isFilterValueANumber = z.coerce.number().safeParse(filterValue).success;

  for (const field of fields) {
    switch (field.type) {
      case FieldMetadataType.TEXT: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'TEXT',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.ADDRESS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'ADDRESS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.LINKS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'LINKS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.FULL_NAME: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'FULL_NAME',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.ARRAY: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'ARRAY',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.EMAILS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'EMAILS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.PHONES: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem: field,
          }),
          operand: ViewFilterOperand.Contains,
          type: 'PHONES',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.NUMBER: {
        if (isFilterValueANumber) {
          anyFieldRecordFilters.push({
            ...createAnyFieldRecordFilterBaseProperties({
              filterValue,
              fieldMetadataItem: field,
            }),
            operand: ViewFilterOperand.Is,
            type: 'NUMBER',
          } satisfies RecordFilter);
        }
        break;
      }
      case FieldMetadataType.CURRENCY: {
        if (isFilterValueANumber) {
          anyFieldRecordFilters.push({
            ...createAnyFieldRecordFilterBaseProperties({
              filterValue,
              fieldMetadataItem: field,
            }),
            operand: ViewFilterOperand.Is,
            type: 'CURRENCY',
            subFieldName: 'amountMicros',
          } satisfies RecordFilter);
        }

        if (isNonEmptyString(filterValue)) {
          const foundCorrespondingCurrencies = currencies.filter(
            (currency) =>
              currency.label.includes(filterValue) ||
              currency.value.includes(filterValue),
          );

          if (isNonEmptyArray(foundCorrespondingCurrencies)) {
            const arrayOfCurrenciesStringified = JSON.stringify(
              foundCorrespondingCurrencies.map((currency) => currency.value),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                filterValue: arrayOfCurrenciesStringified,
                fieldMetadataItem: field,
              }),
              operand: ViewFilterOperand.Is,
              type: 'CURRENCY',
              subFieldName: 'currencyCode',
            } satisfies RecordFilter);
          }
        }
        break;
      }
      case FieldMetadataType.SELECT: {
        if (isNonEmptyString(filterValue)) {
          const { foundCorrespondingSelectOptions } =
            filterSelectOptionsOfFieldMetadataItem({
              fieldMetadataItem: field,
              filterValue,
            });

          if (isNonEmptyArray(foundCorrespondingSelectOptions)) {
            const arrayOfSelectValues = JSON.stringify(
              foundCorrespondingSelectOptions.map(
                (selectOption) => selectOption.value,
              ),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                fieldMetadataItem: field,
                filterValue: arrayOfSelectValues,
              }),
              operand: ViewFilterOperand.Is,
              type: 'SELECT',
            } satisfies RecordFilter);
          }
        }
        break;
      }
      case FieldMetadataType.MULTI_SELECT: {
        if (isNonEmptyString(filterValue)) {
          const { foundCorrespondingSelectOptions } =
            filterSelectOptionsOfFieldMetadataItem({
              fieldMetadataItem: field,
              filterValue,
            });

          if (isNonEmptyArray(foundCorrespondingSelectOptions)) {
            const arrayOfSelectValues = JSON.stringify(
              foundCorrespondingSelectOptions.map(
                (selectOption) => selectOption.value,
              ),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                fieldMetadataItem: field,
                filterValue: arrayOfSelectValues,
              }),
              operand: ViewFilterOperand.Contains,
              type: 'MULTI_SELECT',
            } satisfies RecordFilter);
          }
        }
        break;
      }
    }
  }

  const baseRecordGqlOperationFilters = anyFieldRecordFilters
    .map((recordFilter) =>
      turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies: {},
        fieldMetadataItems: fields,
        recordFilter,
      }),
    )
    .filter(isDefined);

  const recordGqlOperationFilter: RecordGqlOperationFilter = {
    or: baseRecordGqlOperationFilters,
  };

  if (baseRecordGqlOperationFilters.length === 0) {
    return { recordGqlOperationFilter: {} };
  }

  return {
    recordGqlOperationFilter,
  };
};
