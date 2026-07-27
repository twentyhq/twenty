import { isDefined } from 'twenty-shared/utils';

export const applyCumulativeToLineDataPoints = <
  TDataPoint extends { y: number | null },
>(
  dataPoints: TDataPoint[],
): TDataPoint[] => {
  const result: TDataPoint[] = [];
  let runningTotal = 0;

  for (const dataPoint of dataPoints) {
    if (isDefined(dataPoint.y)) {
      runningTotal += dataPoint.y;
    }

    result.push({ ...dataPoint, y: runningTotal });
  }

  return result;
};
