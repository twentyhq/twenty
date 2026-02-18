import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const filterLineChartXValuesByRange = (
  xValues: string[],
  seriesMap: Map<string, Map<string, number>>,
  seriesIds: string[],
  rangeMin?: number | null,
  rangeMax?: number | null,
): string[] => {
  if (!isDefined(rangeMin) && !isDefined(rangeMax)) {
    return xValues;
  }

  return xValues.filter((xValue) => {
    const totalValue = seriesIds.reduce((sum, seriesId) => {
      const xToYMap = seriesMap.get(seriesId) ?? new Map();
      const yValue = xToYMap.get(xValue) ?? 0;

      return sum + (isNumber(yValue) ? yValue : 0);
    }, 0);

    if (isDefined(rangeMin) && totalValue < rangeMin) {
      return false;
    }

    if (isDefined(rangeMax) && totalValue > rangeMax) {
      return false;
    }

    return true;
  });
};
