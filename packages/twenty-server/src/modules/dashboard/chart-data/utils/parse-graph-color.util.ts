import { isDefined } from 'twenty-shared/utils';

import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';

const VALID_COLORS = Object.values(GraphColor);

export const parseGraphColor = (
  value: string | null | undefined,
): GraphColor | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (value === 'auto') {
    return undefined;
  }

  const normalizedValue = value.toUpperCase();

  if (VALID_COLORS.includes(normalizedValue as GraphColor)) {
    return normalizedValue as GraphColor;
  }

  return undefined;
};
