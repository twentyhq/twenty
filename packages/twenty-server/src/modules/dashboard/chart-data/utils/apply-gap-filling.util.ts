import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  isFieldMetadataArrayKind,
  isFieldMetadataDateKind,
  isFieldMetadataSelectKind,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import {
  fillDateGaps,
  fillDateGapsTwoDimensional,
} from 'src/modules/dashboard/chart-data/utils/fill-date-gaps.util';
import {
  fillSelectGaps,
  fillSelectGapsTwoDimensional,
} from 'src/modules/dashboard/chart-data/utils/fill-select-gaps.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';

type ApplyGapFillingParams = {
  data: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  dateGranularity: ObjectRecordGroupByDateGranularity | null | undefined;
  omitNullValues: boolean;
  isDescOrder: boolean;
  isTwoDimensional: boolean;
  splitMultiValueFields?: boolean;
  dateRange?: DateRangeBounds;
  maximumNumberOfSegments?: number;
};

type ApplyGapFillingResult = {
  data: GroupByRawResult[];
  wasTruncated: boolean;
};

export const applyGapFilling = ({
  data,
  primaryAxisGroupByField,
  dateGranularity,
  omitNullValues,
  isDescOrder,
  isTwoDimensional,
  splitMultiValueFields,
  dateRange,
  maximumNumberOfSegments,
}: ApplyGapFillingParams): ApplyGapFillingResult => {
  if (omitNullValues) {
    return { data, wasTruncated: false };
  }

  let currentData = data;
  let wasTruncated = false;

  const isPrimaryFieldDate = isFieldMetadataDateKind(
    primaryAxisGroupByField.type,
  );

  if (isPrimaryFieldDate) {
    const dateResult = isTwoDimensional
      ? fillDateGapsTwoDimensional({
          data: currentData,
          dateGranularity,
          isDescOrder,
          dateRange,
          maximumNumberOfSegments,
        })
      : fillDateGaps({
          data: currentData,
          dateGranularity,
          isDescOrder,
          dateRange,
        });

    currentData = dateResult.data;
    wasTruncated = dateResult.wasTruncated;
  }

  const isArrayFieldWithoutSplit =
    isFieldMetadataArrayKind(primaryAxisGroupByField.type) &&
    !(splitMultiValueFields ?? true);

  const isPrimaryFieldSelect = isFieldMetadataSelectKind(
    primaryAxisGroupByField.type,
  );

  if (isPrimaryFieldSelect && !isArrayFieldWithoutSplit) {
    const selectOptions = getSelectOptions(primaryAxisGroupByField);

    const fillSelectGapsFn = isTwoDimensional
      ? fillSelectGapsTwoDimensional
      : fillSelectGaps;

    currentData = fillSelectGapsFn({
      data: currentData,
      selectOptions,
    });
  }

  return { data: currentData, wasTruncated };
};
