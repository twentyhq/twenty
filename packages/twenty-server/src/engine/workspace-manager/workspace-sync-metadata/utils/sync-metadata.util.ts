/**
 * This utility function converts an array of ObjectMetadataEntity objects into a map,
 * where the keys are the nameSingular properties of the objects.
 * Each object in the map contains the original object metadata and its fields as a nested map.
 *
 * @param arr - The array of ObjectMetadataEntity objects to convert.
 * @param keyFactory
 * @returns A map of object metadata, with nameSingular as the key and the object as the value.
 */
export const mapObjectMetadataByUniqueIdentifier = <
  T extends { standardId: string | null },
>(
  arr: T[],
  keyFactory: (obj: T) => string | null = (obj) => obj.standardId,
): Record<string, T> => {
  return arr.reduce(
    (acc, curr) => {
      const key = keyFactory(curr);

      if (!key) {
        return acc;
      }

      acc[key] = {
        ...curr,
      };

      return acc;
    },
    {} as Record<string, T>,
  );
};
