import { isDefined } from '@/utils/validation';

import { fastDeepEqual } from './json/fast-deep-equal';

type Diff<T extends { id: string }> = {
  toCreate: T[];
  toUpdate: T[];
  toRestoreAndUpdate: T[];
  idsToRemove: string[];
};

const extractProperties = <T extends { id: string }>(
  object: T,
  properties: (keyof T)[],
) => {
  return properties.reduce((acc, property) => {
    return {
      ...acc,
      [property]: object[property],
    };
  }, {});
};

type ComputeDiffBetweenObjectsParams<
  T extends { id: string },
  K extends { id: string },
> = {
  existingObjects: T[];
  receivedObjects: K[];
  propertiesToCompare: (keyof K & keyof T)[];
  isEntityIncluded: (entity: NoInfer<T>) => boolean;
};

export const computeDiffBetweenObjects = <
  T extends { id: string },
  K extends { id: string },
>({
  existingObjects,
  receivedObjects,
  propertiesToCompare,
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
      } else {
        const comparableExistingEntity = extractProperties(
          existingEntity,
          propertiesToCompare,
        );

        const comparableReceivedEntity = extractProperties(
          receivedObject,
          propertiesToCompare,
        );

        if (
          !fastDeepEqual(comparableExistingEntity, comparableReceivedEntity)
        ) {
          toUpdate.push(receivedObject);
        }
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
