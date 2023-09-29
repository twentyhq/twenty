import isObject from 'lodash.isobject';
import lodashCamelCase from 'lodash.camelcase';
import { PascalCase, PascalCasedPropertiesDeep } from 'type-fest';

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const pascalCase = <T>(text: T) =>
  capitalizeFirstLetter(
    lodashCamelCase(text as unknown as string),
  ) as PascalCase<T>;

export const pascalCaseDeep = <T>(value: T): PascalCasedPropertiesDeep<T> => {
  // Check if it's an array
  if (Array.isArray(value)) {
    return value.map(pascalCaseDeep) as PascalCasedPropertiesDeep<T>;
  }

  // Check if it's an object
  if (isObject(value)) {
    const result: Record<string, any> = {};

    for (const key in value) {
      result[pascalCase(key)] = pascalCaseDeep(value[key]);
    }

    return result as PascalCasedPropertiesDeep<T>;
  }

  return value as PascalCasedPropertiesDeep<T>;
};
