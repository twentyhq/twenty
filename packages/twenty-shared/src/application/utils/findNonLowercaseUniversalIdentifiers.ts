import { isString } from '@sniptt/guards';

import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const isUniversalIdentifierKey = (key: string): boolean =>
  key === 'universalIdentifier' || /UniversalIdentifiers?$/.test(key);

export const findNonLowercaseUniversalIdentifiers = (
  manifest: unknown,
): string[] => {
  const nonLowercaseUniversalIdentifiers = new Set<string>();

  const visit = (value: unknown, isUniversalIdentifierValue: boolean) => {
    if (isString(value)) {
      if (isUniversalIdentifierValue && value !== value.toLowerCase()) {
        nonLowercaseUniversalIdentifiers.add(value);
      }

      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, isUniversalIdentifierValue));

      return;
    }

    if (isPlainObject(value)) {
      Object.entries(value).forEach(([key, nestedValue]) =>
        visit(nestedValue, isUniversalIdentifierKey(key)),
      );
    }
  };

  visit(manifest, false);

  return [...nonLowercaseUniversalIdentifiers];
};
