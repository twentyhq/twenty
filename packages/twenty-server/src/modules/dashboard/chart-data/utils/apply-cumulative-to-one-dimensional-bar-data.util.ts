import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';

type OneDimensionalBarDataPoint = {
  formattedValue: string;
  aggregateValue: number;
  rawValue: RawDimensionValue;
};

export const applyCumulativeToOneDimensionalBarData = (
  dataPoints: OneDimensionalBarDataPoint[],
): OneDimensionalBarDataPoint[] => {
  const result: OneDimensionalBarDataPoint[] = [];
  let runningTotal = 0;

  for (const dataPoint of dataPoints) {
    runningTotal += dataPoint.aggregateValue;

    result.push({ ...dataPoint, aggregateValue: runningTotal });
  }

  return result;
};
