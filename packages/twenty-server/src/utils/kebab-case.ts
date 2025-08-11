import isObject from 'lodash.isobject';
import lodashKebabCase from 'lodash.kebabcase';
import { type KebabCase, type KebabCasedPropertiesDeep } from 'type-fest';

export const kebabCase = <T>(text: T) =>
  lodashKebabCase(text as unknown as string) as KebabCase<T>;

export const kebabCaseDeep = <T>(value: T): KebabCasedPropertiesDeep<T> => {
  // Check if it's an array
  if (Array.isArray(value)) {
    return value.map(kebabCaseDeep) as KebabCasedPropertiesDeep<T>;
  }

  // Check if it's an object
  if (isObject(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};

    for (const key in value) {
      result[kebabCase(key)] = kebabCaseDeep(value[key]);
    }

    return result as KebabCasedPropertiesDeep<T>;
  }

  return value as KebabCasedPropertiesDeep<T>;
};
