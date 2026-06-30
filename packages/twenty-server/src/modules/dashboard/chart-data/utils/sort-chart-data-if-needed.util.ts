import {
  type FieldMetadataType,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { compareDimensionValues } from 'src/modules/dashboard/chart-data/utils/compare-dimension-values.util';
import { sortByManualOrder } from 'src/modules/dashboard/chart-data/utils/sort-by-manual-order.util';
import { sortBySelectOptionPosition } from 'src/modules/dashboard/chart-data/utils/sort-by-select-option-position.util';

type FieldMetadataOption = {
  value: string;
  position: number;
};

type SortChartDataParams<T> = {
  data: T[];
  orderBy?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFieldValue: (item: T) => string;
  getNumericValue: (item: T) => number;
  selectFieldOptions?: FieldMetadataOption[] | null;
  fieldType?: FieldMetadataType;
  subFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
};

export const sortChartDataIfNeeded = <T>({
  data,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  getFieldValue,
  getNumericValue,
  selectFieldOptions,
  fieldType,
  subFieldName,
  dateGranularity,
}: SortChartDataParams<T>): T[] => {
  if (!isDefined(orderBy)) {
    return data;
  }

  switch (orderBy) {
    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return data;
      }

      return sortByManualOrder({
        items: data,
        manualSortOrder,
        getRawValue: (item) => {
          const formatted = getFieldValue(item);
          const raw = formattedToRawLookup.get(formatted);

          return isDefined(raw) ? String(raw) : formatted;
        },
      });
    }
    case GraphOrderBy.VALUE_ASC:
      return [...data].sort((a, b) => getNumericValue(a) - getNumericValue(b));
    case GraphOrderBy.VALUE_DESC:
      return [...data].sort((a, b) => getNumericValue(b) - getNumericValue(a));
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.FIELD_DESC:
      return [...data].sort((a, b) => {
        const formattedValueA = getFieldValue(a);
        const formattedValueB = getFieldValue(b);

        return compareDimensionValues({
          rawValueA: formattedToRawLookup.get(formattedValueA),
          rawValueB: formattedToRawLookup.get(formattedValueB),
          formattedValueA,
          formattedValueB,
          direction: orderBy === GraphOrderBy.FIELD_ASC ? 'ASC' : 'DESC',
          fieldType,
          subFieldName,
          dateGranularity,
        });
      });
    case GraphOrderBy.FIELD_POSITION_ASC:
      if (!isDefined(selectFieldOptions) || selectFieldOptions.length === 0) {
        return data;
      }

      return sortBySelectOptionPosition<T>({
        items: data,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: getFieldValue,
        direction: 'ASC',
      });
    case GraphOrderBy.FIELD_POSITION_DESC:
      if (!isDefined(selectFieldOptions) || selectFieldOptions.length === 0) {
        return data;
      }

      return sortBySelectOptionPosition<T>({
        items: data,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue: getFieldValue,
        direction: 'DESC',
      });
    default:
      return data;
  }
};
