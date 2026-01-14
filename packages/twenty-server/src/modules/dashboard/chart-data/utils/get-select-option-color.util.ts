import { isDefined } from 'twenty-shared/utils';

import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';

type FieldMetadataOption = {
  value: string;
  color?: string;
};

export const getSelectOptionColorForValue = ({
  rawValue,
  selectOptions,
}: {
  rawValue: string | null | undefined;
  selectOptions: FieldMetadataOption[] | null | undefined;
}): GraphColor | undefined => {
  if (!isDefined(selectOptions) || !isDefined(rawValue)) {
    return undefined;
  }

  const option = selectOptions.find((opt) => opt.value === rawValue);

  if (!option?.color) {
    return undefined;
  }

  const VALID_COLORS = Object.values(GraphColor);
  const normalizedColor = option.color.toUpperCase();

  if (VALID_COLORS.includes(normalizedColor as GraphColor)) {
    return normalizedColor as GraphColor;
  }

  return undefined;
};
