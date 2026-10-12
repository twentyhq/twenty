import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

// node-ical returns an object with `val` and `params` instead of a plain string
// when a property has parameters (RFC 5545 3.2, e.g. LANGUAGE=de-DE), and an
// array when it has multiple values (RFC 5545 3.1.2).
export const icalDataExtractPropertyValue = (
  property:
    string | { val?: string; params?: Record<string, unknown> } | undefined,
  defaultValue = '',
): string => {
  if (!isDefined(property)) {
    return defaultValue;
  }

  if (isNonEmptyString(property)) {
    return property;
  }

  if (isDefined(property) && typeof property === 'object') {
    if ('val' in property && isDefined(property.val)) {
      return isString(property.val) ? property.val : String(property.val);
    }

    if (Array.isArray(property)) {
      const values = property
        .map((item) => {
          if (isNonEmptyString(item)) return item;
          if (isDefined(item) && typeof item === 'object' && item?.val)
            return String(item.val);

          return '';
        })
        .filter(Boolean);

      return values.length > 0 ? values.join(', ') : defaultValue;
    }
  }

  return defaultValue;
};
