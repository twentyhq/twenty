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
