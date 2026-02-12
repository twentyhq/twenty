import {
  type FieldMetadataType,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { type FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { compareDimensionValues } from 'src/modules/dashboard/chart-data/utils/compare-dimension-values.util';
import { sortByManualOrder } from 'src/modules/dashboard/chart-data/utils/sort-by-manual-order.util';
import { sortBySelectOptionPosition } from 'src/modules/dashboard/chart-data/utils/sort-by-select-option-position.util';

type SortSecondaryAxisDataParams<T> = {
  items: T[];
  orderBy?: GraphOrderBy | null;
  manualSortOrder?: string[] | null;
  formattedToRawLookup?: Map<string, RawDimensionValue>;
  selectFieldOptions?: FieldMetadataOption[] | null;
  getFormattedValue: (item: T) => string;
  getNumericValue: (item: T) => number;
  fieldType?: FieldMetadataType;
  subFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
};

export const sortSecondaryAxisData = <T>({
  items,
  orderBy,
  manualSortOrder,
  formattedToRawLookup,
  selectFieldOptions,
  getFormattedValue,
  getNumericValue,
  fieldType,
  subFieldName,
  dateGranularity,
}: SortSecondaryAxisDataParams<T>): T[] => {
  if (!isDefined(orderBy)) {
    return items;
  }

  switch (orderBy) {
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.FIELD_DESC:
      return [...items].sort((a, b) => {
        const formattedValueA = getFormattedValue(a);
        const formattedValueB = getFormattedValue(b);

        return compareDimensionValues({
          rawValueA: formattedToRawLookup?.get(formattedValueA),
          rawValueB: formattedToRawLookup?.get(formattedValueB),
          formattedValueA,
          formattedValueB,
          direction: orderBy === GraphOrderBy.FIELD_ASC ? 'ASC' : 'DESC',
          fieldType,
          subFieldName,
          dateGranularity,
        });
      });

    case GraphOrderBy.VALUE_ASC:
      return [...items].sort((a, b) => getNumericValue(a) - getNumericValue(b));

    case GraphOrderBy.VALUE_DESC:
      return [...items].sort((a, b) => getNumericValue(b) - getNumericValue(a));

    case GraphOrderBy.FIELD_POSITION_ASC:
    case GraphOrderBy.FIELD_POSITION_DESC: {
      if (
        !isDefined(selectFieldOptions) ||
        selectFieldOptions.length === 0 ||
        !isDefined(formattedToRawLookup)
      ) {
        return items;
      }

      return sortBySelectOptionPosition({
        items,
        options: selectFieldOptions,
        formattedToRawLookup,
        getFormattedValue,
        direction: orderBy === GraphOrderBy.FIELD_POSITION_ASC ? 'ASC' : 'DESC',
      });
    }

    case GraphOrderBy.MANUAL: {
      if (!isDefined(manualSortOrder)) {
        return items;
      }

      return sortByManualOrder({
        items,
        manualSortOrder,
        getRawValue: (item) => {
          const formattedValue = getFormattedValue(item);
          const rawValue = formattedToRawLookup?.get(formattedValue);

          return isDefined(rawValue) ? String(rawValue) : formattedValue;
        },
      });
    }

    default:
      return items;
  }
};
