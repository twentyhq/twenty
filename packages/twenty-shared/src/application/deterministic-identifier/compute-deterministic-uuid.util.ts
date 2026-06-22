import { v5 } from 'uuid';

export const computeDeterministicUuid = (
  value: string,
  namespace: string,
): string => v5(value, namespace);
