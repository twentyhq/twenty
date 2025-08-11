import { createHash } from 'crypto';

export function createDeterministicUuid(
  uuidOrUuids: string[] | string,
): string {
  const inputForHash = Array.isArray(uuidOrUuids)
    ? uuidOrUuids.join('-')
    : uuidOrUuids;
  const hash = createHash('sha256').update(inputForHash).digest('hex');

  return `20202020-${hash.substring(0, 4)}-4${hash.substring(
    4,
    7,
  )}-8${hash.substring(7, 10)}-${hash.substring(10, 22)}`;
}

type UuidPair = {
  objectId: string;
  standardId: string;
};

export const createRelationDeterministicUuid = (uuidPair: UuidPair): string => {
  // Chaging the order in the array will result in different UUIDs
  return createDeterministicUuid([uuidPair.objectId, uuidPair.standardId]);
};

export const createForeignKeyDeterministicUuid = (
  uuidPair: UuidPair,
): string => {
  // Chaging the order in the array will result in different UUIDs
  return createDeterministicUuid([uuidPair.standardId, uuidPair.objectId]);
};
