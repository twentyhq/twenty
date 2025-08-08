import isObject from 'lodash.isobject';
import lodashSnakeCase from 'lodash.snakecase';
import { type SnakeCase, type SnakeCasedPropertiesDeep } from 'type-fest';

export const snakeCase = <T>(text: T) =>
  lodashSnakeCase(text as unknown as string) as SnakeCase<T>;

export const snakeCaseDeep = <T>(value: T): SnakeCasedPropertiesDeep<T> => {
  // Check if it's an array
  if (Array.isArray(value)) {
    return value.map(snakeCaseDeep) as SnakeCasedPropertiesDeep<T>;
  }

  // Check if it's an object
  if (isObject(value)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};

    for (const key in value) {
      result[snakeCase(key)] = snakeCaseDeep(value[key]);
    }

    return result as SnakeCasedPropertiesDeep<T>;
  }

  return value as SnakeCasedPropertiesDeep<T>;
};
