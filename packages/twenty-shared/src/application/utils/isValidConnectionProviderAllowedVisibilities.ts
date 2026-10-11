import { type ConnectedAccountVisibility } from '@/types/ConnectedAccountVisibility';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

export const isValidConnectionProviderAllowedVisibilities = (
  visibilities: unknown,
): visibilities is ConnectedAccountVisibility[] =>
  Array.isArray(visibilities) &&
  isNonEmptyArray(visibilities) &&
  [...visibilities].every(
    (visibility) => visibility === 'user' || visibility === 'workspace',
  ) &&
  new Set(visibilities).size === visibilities.length;
