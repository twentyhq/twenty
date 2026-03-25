import { findById } from '@/utils/array/findById';

export const upsertPropertiesOfItemIntoArrayOfObjectsComparingId = <
  T extends { id: string },
>(
  arrayToUpsertInto: T[],
  propertiesToUpsert: Partial<T> & { id: string },
): T[] => {
  const alreadyExistingItemIndex = arrayToUpsertInto.findIndex(
    findById(propertiesToUpsert.id),
  );

  const shouldReplaceItem = alreadyExistingItemIndex > -1;

  if (shouldReplaceItem) {
    const newArray = [...arrayToUpsertInto];

    const itemToUpsert = {
      ...arrayToUpsertInto[alreadyExistingItemIndex],
      ...propertiesToUpsert,
    } as T;

    newArray.splice(alreadyExistingItemIndex, 1, itemToUpsert);

    return newArray;
  } else {
    return arrayToUpsertInto.concat({
      ...propertiesToUpsert,
    } as T);
  }
};
