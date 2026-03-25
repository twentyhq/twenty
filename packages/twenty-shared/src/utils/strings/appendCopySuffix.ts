import { isNonEmptyString } from '@sniptt/guards';

const COPY_SUFFIX = '(Copy)';
const COPY_SUFFIX_LOWERCASE = '(copy)';

export const appendCopySuffix = (value: string): string => {
  if (!isNonEmptyString(value)) {
    return value;
  }

  if (value.toLowerCase().endsWith(COPY_SUFFIX_LOWERCASE)) {
    return value;
  }

  return `${value} ${COPY_SUFFIX}`;
};
