import { isDefined } from '@/utils/validation';

import { fastDeepEqual } from './json/fast-deep-equal';

type Diff<T extends { id: string }> = {
  toCreate: T[];
  toUpdate: T[];
  toRestoreAndUpdate: T[];
  idsToRemove: string[];
};

type ComputeDiffBetweenObjectsParams<
  T extends { id: string },
  K extends { id: string },
> = {
  existingObjects: T[];
  receivedObjects: K[];
  propertiesToCompare: (keyof K & keyof T)[];
  propertiesClearedWhenOmitted?: (keyof K & keyof T)[];
  isEntityIncluded: (entity: NoInfer<T>) => boolean;
};

// An omitted property keeps the stored value, unless the caller clears it on omission
const hasReceivedObjectChanged = <
  T extends { id: string },
  K extends { id: string },
>({
  existingObject,
  receivedObject,
  propertiesToCompare,
  propertiesClearedWhenOmitted,
}: {
  existingObject: T;
  receivedObject: K;
  propertiesToCompare: (keyof K & keyof T)[];
  propertiesClearedWhenOmitted: (keyof K & keyof T)[];
}): boolean =>
  propertiesToCompare.some((property) => {
    const receivedValue = receivedObject[property];

    if (receivedValue !== undefined) {
      return !fastDeepEqual(existingObject[property], receivedValue);
    }

    return (
      propertiesClearedWhenOmitted.includes(property) &&
      isDefined(existingObject[property])
    );
  });

export const computeDiffBetweenObjects = <
  T extends { id: string },
  K extends { id: string },
>({
  existingObjects,
  receivedObjects,
  propertiesToCompare,
  propertiesClearedWhenOmitted = [],
  isEntityIncluded,
}: ComputeDiffBetweenObjectsParams<T, K>): Diff<K> => {
  const toCreate: K[] = [];
  const toUpdate: K[] = [];
  const toRestoreAndUpdate: K[] = [];

  const existingEntitiesMap = new Map(
    existingObjects.map((entity) => [entity.id, entity]),
  );
  const receivedEntitiesMap = new Map(
    receivedObjects.map((entity) => [entity.id, entity]),
  );

  for (const receivedObject of receivedObjects) {
    const existingEntity = existingEntitiesMap.get(receivedObject.id);

    if (isDefined(existingEntity)) {
      if (!isEntityIncluded(existingEntity)) {
        toRestoreAndUpdate.push(receivedObject);
      } else if (
        hasReceivedObjectChanged({
          existingObject: existingEntity,
          receivedObject,
          propertiesToCompare,
          propertiesClearedWhenOmitted,
        })
      ) {
        toUpdate.push(receivedObject);
      }
    } else {
      toCreate.push(receivedObject);
    }
  }

  const idsToRemove = existingObjects
    .filter((existingEntity) => isEntityIncluded(existingEntity))
    .filter((existingEntity) => !receivedEntitiesMap.has(existingEntity.id))
    .map((entity) => entity.id);

  return {
    toCreate,
    toUpdate,
    toRestoreAndUpdate,
    idsToRemove,
  };
};
