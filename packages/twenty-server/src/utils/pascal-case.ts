import isObject from 'lodash.isobject';
import lodashCamelCase from 'lodash.camelcase';
import upperFirst from 'lodash.upperfirst';
import { type PascalCase, type PascalCasedPropertiesDeep } from 'type-fest';

export const pascalCase = <T>(text: T) =>
  upperFirst(lodashCamelCase(text as unknown as string)) as PascalCase<T>;

export const pascalCaseDeep = <T>(value: T): PascalCasedPropertiesDeep<T> => {
  // Check if it's an array
  if (Array.isArray(value)) {
    return value.map(pascalCaseDeep) as PascalCasedPropertiesDeep<T>;
  }

  // Check if it's an object
  if (isObject(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};

    for (const key in value) {
      result[pascalCase(key)] = pascalCaseDeep(value[key]);
    }

    return result as PascalCasedPropertiesDeep<T>;
  }

  return value as PascalCasedPropertiesDeep<T>;
};
