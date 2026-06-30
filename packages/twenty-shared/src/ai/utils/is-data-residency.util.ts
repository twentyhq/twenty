import {
  DATA_RESIDENCY_KEYS,
  type DataResidency,
} from '../constants/data-residency.const';

export const isDataResidency = (value: string): value is DataResidency =>
  (DATA_RESIDENCY_KEYS as readonly string[]).includes(value);
