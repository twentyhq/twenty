import { isNonEmptyString } from '@sniptt/guards';

export const parseRecordFilterBetweenValue = (
  value: string | undefined | null,
): { startValue: string; endValue: string } => {
  if (!isNonEmptyString(value)) {
    return { startValue: '', endValue: '' };
  }

  const commaIndex = value.indexOf(',');

  if (commaIndex === -1) {
    return { startValue: value.trim(), endValue: '' };
  }

  return {
    startValue: value.slice(0, commaIndex).trim(),
    endValue: value.slice(commaIndex + 1).trim(),
  };
};
