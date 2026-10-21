import { isDefined } from '../utils/validation/isDefined';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

// Unfillable placeholders are left as written so whoever owns the values can fill them later.
export const interpolateMessagePlaceholders = (
  message: string,
  values?: Record<string, string | number | undefined>,
): string => {
  if (!isDefined(values)) {
    return message;
  }

  return message.replace(PLACEHOLDER_REGEX, (placeholder, name: string) => {
    const value = values[name];

    return isDefined(value) ? String(value) : placeholder;
  });
};
