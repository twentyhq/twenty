import { type ProcessedOneDimensionalDataPoint } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';

export const applyCumulativeToOneDimensionalBarData = (
  dataPoints: ProcessedOneDimensionalDataPoint[],
): ProcessedOneDimensionalDataPoint[] => {
  const result: ProcessedOneDimensionalDataPoint[] = [];
  let runningTotal = 0;

  for (const dataPoint of dataPoints) {
    runningTotal += dataPoint.aggregateValue;

    result.push({ ...dataPoint, aggregateValue: runningTotal });
  }

  return result;
};
