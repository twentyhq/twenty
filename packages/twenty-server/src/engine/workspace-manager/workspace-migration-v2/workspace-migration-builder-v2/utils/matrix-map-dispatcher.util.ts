import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';

export type MatrixMapDispatcherResult<T> = {
  created: T[];
  deleted: T[];
  updated: FromTo<T>[];
};

export type UniqueIdentifierItem = {
  uniqueIdentifier: string;
};

export const matrixMapDispatcher = <T extends UniqueIdentifierItem>({
  from,
  to,
}: FromTo<T[]>): MatrixMapDispatcherResult<T> => {
  const initialDispatcher: MatrixMapDispatcherResult<T> = {
    created: [],
    updated: [],
    deleted: [],
  };

  // Create maps for faster lookups
  const fromMap = new Map(from.map((obj) => [obj.uniqueIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.uniqueIdentifier, obj]));

  // Find deleted objects (exist in 'from' but not in 'to')
  for (const [identifier, fromObj] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deleted.push(fromObj);
    }
  }

  // Find created objects (exist in 'to' but not in 'from')
  for (const [identifier, toObj] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.created.push(toObj);
    }
  }

  // Find updated objects (exist in both, need to compare)
  for (const [identifier, fromObj] of fromMap) {
    const toObj = toMap.get(identifier);
    if (toObj) {
      initialDispatcher.updated.push({
        from: fromObj,
        to: toObj,
      });
    }
  }

  return initialDispatcher;
};
