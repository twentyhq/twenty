import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/metadata/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';

/**
 * This utility function filters out properties from an object based on a list of properties to ignore.
 * It returns a new object with only the properties that are not in the ignore list.
 *
 * @param obj - The object to filter.
 * @param propertiesToIgnore - An array of property names to ignore.
 * @returns A new object with filtered properties.
 */
export const filterIgnoredProperties = <T extends object>(
  obj: T,
  propertiesToIgnore: string[],
  mapFunction?: (value: any) => any,
): T => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !propertiesToIgnore.includes(key))
      .map(([key, value]) => [key, mapFunction ? mapFunction(value) : value]),
  ) as T;
};

type TransformToString<T, Keys extends keyof any> = {
  [P in keyof T]: P extends Keys ? string : T[P];
};

export const transformFieldMetadataForComparison = <
  T extends {
    name: string;
  },
  Keys extends keyof T,
>(
  fieldMetadataCollection: T[],
  options: {
    fieldPropertiesToIgnore?: readonly Keys[];
    fieldPropertiesToStringify?: readonly Keys[];
  },
): Record<string, TransformToString<T, Keys>> => {
  const fieldPropertiesToIgnore = (options.fieldPropertiesToIgnore ??
    []) as readonly string[];
  const fieldPropertiesToStringify = (options.fieldPropertiesToStringify ??
    []) as readonly string[];

  const fieldMetadataMap = fieldMetadataCollection.reduce(
    (acc, field) => {
      // Ignore properties that are not relevant for comparison
      if (fieldPropertiesToIgnore.includes(field.name)) {
        return acc;
      }

      const transformedField = { ...field } as TransformToString<T, Keys>;

      // Stringify properties that are not primitives
      if (fieldPropertiesToStringify.includes(field.name)) {
        // Order field value alphabetically to ensure consistent comparison
        const orderedValue = Object.fromEntries(
          Object.entries(field[field.name]).sort(),
        );

        transformedField[field.name] = JSON.stringify(orderedValue);
      }

      acc[field.name] = transformedField;

      return acc;
    },
    {} as Record<string, TransformToString<T, Keys>>,
  );

  return fieldMetadataMap;
};

/**
 * This utility function converts an array of ObjectMetadataEntity objects into a map,
 * where the keys are the nameSingular properties of the objects.
 * Each object in the map contains the original object metadata and its fields as a nested map.
 *
 * @param arr - The array of ObjectMetadataEntity objects to convert.
 * @returns A map of object metadata, with nameSingular as the key and the object as the value.
 */
export const mapObjectMetadataByUniqueIdentifier = <
  T extends { nameSingular: string },
>(
  arr: T[],
): Record<string, T> => {
  return arr.reduce(
    (acc, curr) => {
      acc[curr.nameSingular] = {
        ...curr,
      };

      return acc;
    },
    {} as Record<string, T>,
  );
};

export const convertStringifiedFieldsToJSON = <
  T extends {
    targetColumnMap?: string | null;
    defaultValue?: string | null;
    options?: string | null;
  },
>(
  fieldMetadata: T,
): T & {
  targetColumnMap?: FieldMetadataTargetColumnMap;
  defaultValue?: FieldMetadataDefaultValue;
  options?: FieldMetadataOptions;
} => {
  if (fieldMetadata.targetColumnMap) {
    fieldMetadata.targetColumnMap = JSON.parse(fieldMetadata.targetColumnMap);
  }

  if (fieldMetadata.defaultValue) {
    fieldMetadata.defaultValue = JSON.parse(fieldMetadata.defaultValue);
  }

  if (fieldMetadata.options) {
    fieldMetadata.options = JSON.parse(fieldMetadata.options);
  }

  return fieldMetadata as T & {
    targetColumnMap?: FieldMetadataTargetColumnMap;
    defaultValue?: FieldMetadataDefaultValue;
    options?: FieldMetadataOptions;
  };
};
