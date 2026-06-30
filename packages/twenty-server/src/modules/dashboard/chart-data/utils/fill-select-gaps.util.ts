import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';

type FillSelectGapsParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataOption[] | null | undefined;
};

export const fillSelectGaps = ({
  data,
  selectOptions,
}: FillSelectGapsParams): GroupByRawResult[] => {
  if (
    !isDefined(selectOptions) ||
    selectOptions.length === 0 ||
    data.length === 0
  ) {
    return data;
  }

  const existingGroupsMap = new Map<string, GroupByRawResult>();

  for (const item of data) {
    const dimensionValue = item.groupByDimensionValues?.[0];

    if (isDefined(dimensionValue)) {
      existingGroupsMap.set(String(dimensionValue), item);
    }
  }

  const filledData: GroupByRawResult[] = selectOptions.map((option) => {
    const existingGroup = existingGroupsMap.get(option.value);

    if (isDefined(existingGroup)) {
      return existingGroup;
    }

    return {
      groupByDimensionValues: [option.value],
      aggregateValue: 0,
    };
  });

  return filledData;
};

type FillSelectGapsTwoDimensionalParams = {
  data: GroupByRawResult[];
  selectOptions: FieldMetadataOption[] | null | undefined;
};

export const fillSelectGapsTwoDimensional = ({
  data,
  selectOptions,
}: FillSelectGapsTwoDimensionalParams): GroupByRawResult[] => {
  if (
    !isDefined(selectOptions) ||
    selectOptions.length === 0 ||
    data.length === 0
  ) {
    return data;
  }

  const existingGroupsMap = new Map<string, GroupByRawResult>();
  const uniqueSecondDimensionValues = new Set<unknown>();

  for (const item of data) {
    const primaryValue = item.groupByDimensionValues?.[0];
    const secondaryValue = item.groupByDimensionValues?.[1] ?? null;

    if (isDefined(primaryValue)) {
      const key = `${String(primaryValue)}_${String(secondaryValue)}`;

      existingGroupsMap.set(key, item);
      uniqueSecondDimensionValues.add(secondaryValue);
    }
  }

  const filledData: GroupByRawResult[] = selectOptions.flatMap((option) =>
    Array.from(uniqueSecondDimensionValues).map((secondaryValue) => {
      const key = `${option.value}_${String(secondaryValue)}`;
      const existingGroup = existingGroupsMap.get(key);

      if (isDefined(existingGroup)) {
        return existingGroup;
      }

      return {
        groupByDimensionValues: [option.value, secondaryValue],
        aggregateValue: 0,
      };
    }),
  );

  return filledData;
};
