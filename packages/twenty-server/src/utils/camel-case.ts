import isObject from 'lodash.isobject';
import lodashCamelCase from 'lodash.camelcase';
import { type CamelCase, type CamelCasedPropertiesDeep } from 'type-fest';

export const camelCase = <T>(text: T) =>
  lodashCamelCase(text as unknown as string) as CamelCase<T>;

export const camelCaseDeep = <T>(value: T): CamelCasedPropertiesDeep<T> => {
  // Check if it's an array
  if (Array.isArray(value)) {
    return value.map(camelCaseDeep) as CamelCasedPropertiesDeep<T>;
  }

  // Check if it's an object
  if (isObject(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};

    for (const key in value) {
      result[camelCase(key)] = camelCaseDeep(value[key]);
    }

    return result as CamelCasedPropertiesDeep<T>;
  }

  return value as CamelCasedPropertiesDeep<T>;
};
