import { isNonEmptyString } from '@sniptt/guards';

export const getValidTimeZoneOrUndefined = (
  timeZone: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(timeZone) || timeZone === 'system') {
    return undefined;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone });

    return timeZone;
  } catch {
    return undefined;
  }
};
