import {
  DATA_RESIDENCIES,
  type DataResidency,
} from '../constants/data-residency.const';

export const isDataResidency = (value: string): value is DataResidency =>
  DATA_RESIDENCIES.some((dataResidency) => dataResidency === value);
