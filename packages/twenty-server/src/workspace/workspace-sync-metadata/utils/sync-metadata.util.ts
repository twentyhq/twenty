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
export const filterIgnoredProperties = (
  obj: any,
  propertiesToIgnore: string[],
  mapFunction?: (value: any) => any,
) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !propertiesToIgnore.includes(key))
      .map(([key, value]) => [key, mapFunction ? mapFunction(value) : value]),
  );
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
  T extends { nameSingular: string; fields: U[] },
  U extends { name: string },
>(
  arr: T[],
): Record<string, Omit<T, 'fields'> & { fields: Record<string, U> }> => {
  return arr.reduce(
    (acc, curr) => {
      acc[curr.nameSingular] = {
        ...curr,
        fields: curr.fields.reduce(
          (acc, curr) => {
            acc[curr.name] = curr;

            return acc;
          },
          {} as Record<string, U>,
        ),
      };

      return acc;
    },
    {} as Record<string, Omit<T, 'fields'> & { fields: Record<string, U> }>,
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
