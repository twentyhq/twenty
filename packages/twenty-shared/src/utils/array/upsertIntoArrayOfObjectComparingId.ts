import { findById } from '@/utils/array/findById';

export const upsertIntoArrayOfObjectsComparingId = <T extends { id: string }>(
  arrayToUpsertInto: T[],
  itemToUpsert: T,
): T[] => {
  const alreadyExistingItemIndex = arrayToUpsertInto.findIndex(
    findById(itemToUpsert.id),
  );

  const shouldReplaceItem = alreadyExistingItemIndex > -1;

  if (shouldReplaceItem) {
    const newArray = [...arrayToUpsertInto];

    newArray.splice(alreadyExistingItemIndex, 1, itemToUpsert);

    return newArray;
  } else {
    return arrayToUpsertInto.concat(itemToUpsert);
  }
};
