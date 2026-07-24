import { isNumber } from '@sniptt/guards';

export const applyCumulativeToTwoDimensionalBarData = ({
  data,
  keys,
}: {
  data: Record<string, string | number>[];
  keys: string[];
}): Record<string, string | number>[] => {
  const runningTotalByKey: Record<string, number> = {};

  for (const key of keys) {
    runningTotalByKey[key] = 0;
  }

  const result: Record<string, string | number>[] = [];

  for (const datum of data) {
    const cumulativeDatum = { ...datum };

    for (const key of keys) {
      const value = datum[key];

      if (isNumber(value) && Number.isFinite(value)) {
        runningTotalByKey[key] += value;
      }

      cumulativeDatum[key] = runningTotalByKey[key];
    }

    result.push(cumulativeDatum);
  }

  return result;
};
