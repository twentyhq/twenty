import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

/**
 * Extracts the string value from an iCal property that may have parameters.
 * Per RFC 5545, properties can have parameters like LANGUAGE=de-DE, which causes
 * node-ical to return an object with `val` and `params` instead of a plain string.
 *
 * RFC 5545 Section 3.1.2 also allows multiple values in a single property.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.2 (Property Parameters)
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.1.2 (Multiple Values)
 */
export const icalDataExtractPropertyValue = (
  property:
    | string
    | { val?: string; params?: Record<string, unknown> }
    | undefined,
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
